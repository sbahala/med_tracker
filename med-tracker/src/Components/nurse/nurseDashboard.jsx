import React ,{ useState }from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../../firebase";
import { auth } from '../../firebase';
import { signOut } from "firebase/auth";
import { doc,updateDoc,collection, query, where, getDocs } from 'firebase/firestore';

const NurseDashboard = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [appointmentDetails, setAppointmentDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [editingVitalsFor, setEditingVitalsFor] = useState(null);
    const [selectedAppointmentStatus, setSelectedAppointmentStatus] = useState('');
    //const [selectedStatus, setSelectedStatus] = useState('');
  
    const handleSearch = async () => {
      setIsLoading(true);
      const fetchedPatientDetails = await searchPatientByName(firstName, lastName);
      if (fetchedPatientDetails.length > 0) { // Assuming there can be multiple patients with the same name
        // For simplicity, taking the first match. You may want to handle multiple matches differently.
        const patient = fetchedPatientDetails[0];
        const fetchedAppointmentDetails = await fetchAppointmentDetailsByPatientId(patient.uid,selectedAppointmentStatus);
        setAppointmentDetails(fetchedAppointmentDetails);
      }
      else{
        alert('No patient records found.');
        setAppointmentDetails(null);
      }
      setIsLoading(false);
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    const handleVitalsChange = (appointmentId, name, value) => {
        setAppointmentDetails(prevDetails =>
            prevDetails.map(appt => 
                appt.appointmentId === appointmentId ? { ...appt, [name]: value } : appt
            )
        );
    };
    const handleBackToSelection = () => {
        setSelectedAppointmentStatus('');
        setAppointmentDetails(null); // Optionally clear any previously loaded appointment details
    };

    const handleVitalsSubmit = async (appointmentId) => {
        const appointmentToUpdate = appointmentDetails.find(appt => appt.appointmentId === appointmentId);
        const appointmentRef = doc(db, "appointments", appointmentId);
        if (!appointmentToUpdate || !(appointmentToUpdate.height?.trim() ?? '') || !(appointmentToUpdate.weight?.trim() ?? '' ) || !(appointmentToUpdate.bloodPressure?.trim() ?? '') || !(appointmentToUpdate.allergies?.trim() ?? '') || !(appointmentToUpdate.familyMedicalHistory?.trim() ?? '')) {
            alert('Vital values are required !!');
            return;
        }
        try {
            await updateDoc(appointmentRef, {
                height: appointmentToUpdate.height,
                weight: appointmentToUpdate.weight,
                bloodPressure: appointmentToUpdate.bloodPressure,
                allergies: appointmentToUpdate.allergies,
                familyMedicalHistory: appointmentToUpdate.familyMedicalHistory,
            });
            alert('Vitals updated successfully for appointment ID: ' + appointmentId);
            const updatedAppointmentDetails = appointmentDetails.map(appt => 
                appt.appointmentId === appointmentId ? { ...appt, vitalsSubmitted: true } : appt
            );
            setAppointmentDetails(updatedAppointmentDetails);
            setEditingVitalsFor(null);
        } catch (error) {
            console.error('Error updating vitals: ', error);
            alert('Failed to update vitals for appointment ID: ' + appointmentId);
        }
    };
    const toggleVitalsForm = (appointmentId) => {
        setEditingVitalsFor(editingVitalsFor === appointmentId ? null : appointmentId);
    };
    const handleAppointmentSelection = (status)=>{
        setSelectedAppointmentStatus(status);
        setAppointmentDetails(null);
        setFirstName('');
        setLastName('');
    };
    const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
        const appointmentToUpdate = appointmentDetails.find(appt => appt.appointmentId === appointmentId);
        if (newStatus === 'OnTime' && (!appointmentToUpdate.height.trim() || !appointmentToUpdate.weight.trim() || !appointmentToUpdate.bloodPressure || !appointmentToUpdate.allergies || !appointmentToUpdate.familyMedicalHistory)) {
            alert('Vital values are required !!');
            return;
        }
        const appointmentRef = doc(db, "appointments", appointmentId);
        try {
            await updateDoc(appointmentRef, {
                status: newStatus,
            });
            alert(`Appointment ${newStatus.toLowerCase()} successfully.`);
            // Optionally, refresh the appointments list to reflect the update
            handleSearch(); // Assuming this will refetch the appointment details
        } catch (error) {
            console.error('Error updating appointment status: ', error);
            alert('Failed to update appointment status.');
        }
    };
    const hasCompleteVitals = (appointment) => {
        const requiredVitals = ['height', 'weight', 'bloodPressure', 'allergies', 'familyMedicalHistory'];
        return requiredVitals.every(vital => appointment[vital] && appointment[vital].trim() !== '');
    };    

    return (
      <div>
         <header className="fixed-header"><h1>Welcome to Nurse Dashboard</h1></header>
        <main className="content">
            {selectedAppointmentStatus ? (
                    <>
                        <h2>{selectedAppointmentStatus} Appointments</h2>
                        <label className="formLabel">First Name</label>
                        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <label className="formLabel">Last Name</label>
                        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        <button onClick={handleSearch} disabled={isLoading}>
                            Search
                        </button>
                        {isLoading && <p>Loading...</p>}
                        {appointmentDetails && appointmentDetails.length > 0 ? (
                            <div>
                            <h2>Appointment Details</h2>
                            {appointmentDetails.map((appointment, index) => (
                                <div key={appointment.appointmentId} className="appointmentDetailsContainer">
                                    <div className="appointmentDetail">
                                    <div>
                                    <p><strong>Appointment {index + 1} </strong></p>
                                    <p>Date: {appointment.date}</p>
                                    <p>Time: {appointment.time}</p>
                                    <p>Department: {appointment.departmentName}</p>
                                    <p>Doctor: {appointment.doctorName}</p>
                                    <p>Status: {appointment.status}</p>
                                    </div>
                                    {appointment.status === 'Pending' && (
                                        <div className="appointmentActions">
                                            <button onClick={() => handleUpdateAppointmentStatus(appointment.appointmentId, 'Accepted')} className="button acceptButton">Accept</button>
                                            <button onClick={() => handleUpdateAppointmentStatus(appointment.appointmentId, 'Declined')}className="button declineButton">Decline</button>
                                        </div>
                                     )}
                                     
                                     {appointment.status === 'Accepted' && (
                                        <div className="appointmentActions">
                                            {!appointment.vitalsSubmitted && (
                                                <button onClick={() => toggleVitalsForm(appointment.appointmentId)} className="button updateVitalsButton">
                                                    {editingVitalsFor === appointment.appointmentId ? 'Cancel' : 'Update Vitals for this Appointment'}
                                                </button>
                                            )}
                                            {hasCompleteVitals(appointment) && (
                                                <button onClick={() => handleUpdateAppointmentStatus(appointment.appointmentId, 'OnTime')} className="button onTimeButton">
                                                    Set to OnTime
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    </div>
                                        {editingVitalsFor === appointment.appointmentId && !appointment.vitalsSubmitted && (
                                            <div>
                                                {/* Vitals form fields and submit button */}
                                                <h3>Fill Additional Patient Details</h3>
                                                <input type="text" name="height" placeholder="Height (feet)" value={appointment.height || ''} onChange={(e) => handleVitalsChange(appointment.appointmentId, 'height', e.target.value)} />
                                                <input type="text" name="weight" placeholder="Weight (Lbs)" value={appointment.weight || ''} onChange={(e) => handleVitalsChange(appointment.appointmentId, 'weight', e.target.value)} />
                                                <input type="text" name="bloodPressure" placeholder="Blood Pressure (mmHg)" value={appointment.bloodPressure || ''} onChange={(e) => handleVitalsChange(appointment.appointmentId, 'bloodPressure', e.target.value)} />
                                                <textarea className="textareaField"  name="allergies" placeholder="Allergies" value={appointment.allergies || ''} onChange={(e) => handleVitalsChange(appointment.appointmentId, 'allergies', e.target.value)} />
                                                <textarea className="textareaField"  name="familyMedicalHistory" placeholder="Family Medical History" value={appointment.familyMedicalHistory || ''} onChange={(e) => handleVitalsChange(appointment.appointmentId, 'familyMedicalHistory', e.target.value)} />
                                                <button onClick={() => handleVitalsSubmit(appointment.appointmentId)}>Submit Details</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : !isLoading && (
                            <p>No appointments found. Search for a patient to see their appointments.</p>
                        )}
                    </>
                ) : (
                    <div className="appointmentSelectionContainer">
                        <button onClick={() => handleAppointmentSelection('Pending')} className={selectedAppointmentStatus === 'Pending' ? 'selectionButton active' : 'selectionButton'} >Pending Appointments</button>
                        <button onClick={() => handleAppointmentSelection('Accepted')} className={selectedAppointmentStatus === 'Accepted' ? 'selectionButton active' : 'selectionButton'}>Accepted Appointments</button>
                    </div>
            )}
        </main>
        <footer className = "footer">
                <button onClick={handleBackToSelection}>Back to Appointment Type Selection</button>
                <button className="Logout" onClick={handleSignOut}>Log Out</button>
            </footer>
      </div>
    );
  };

  async function searchPatientByName(firstName, lastName) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("firstName", "==", firstName), where("lastName", "==", lastName));
    const querySnapshot = await getDocs(q);
    const patients = [];
    querySnapshot.forEach((doc) => {
      patients.push({ uid: doc.id, ...doc.data() });
    });
    return patients;
  }
  
  async function fetchAppointmentDetailsByPatientId(patientId,status) {
    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, where("patientId", "==", patientId), where("status", "==", status));
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
        //const data = doc.data();
        appointments.push({ appointmentId: doc.id, ...doc.data() });
        /*if (["Pending", "Accepted", "OnTime"].includes(data.status)) {
        if (["Pending"].includes(data.status)) {
            appointments.push({ appointmentId: doc.id, ...data });
          }*/
    });
    return appointments;
  }
  

export default NurseDashboard;



