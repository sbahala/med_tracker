import React ,{ useState,useEffect, useCallback }from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../../firebase";
import { auth } from '../../firebase';
import { signOut } from "firebase/auth";
import { doc,updateDoc,collection, query, where, getDocs,getDoc } from 'firebase/firestore';

const NurseDashboard = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [appointmentDetails, setAppointmentDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [editingVitalsFor, setEditingVitalsFor] = useState(null);
    const [selectedAppointmentStatus, setSelectedAppointmentStatus] = useState('');
    const [validationErrors, setValidationErrors] = useState({
        height: '',
        weight: '',
        bloodPressure: '',
        allergies: '',
        familyMedicalHistory: '',
      });
    const fetchAppointments = useCallback(async (status) => {
        setIsLoading(true);
        const appointmentsRef = collection(db, "appointments");
        let queryConstraints = [where("status", "==", status)];
        
        const q = query(appointmentsRef, ...queryConstraints);
      
        try {
          const querySnapshot = await getDocs(q);
          const appointmentsWithPatientName = [];
        for (const dataVal of querySnapshot.docs) {
            const appointmentData = { appointmentId: dataVal.id, ...dataVal.data() };
            const patientRef = doc(db, "users", appointmentData.patientId);
            const patientDoc = await getDoc(patientRef);
            if (patientDoc.exists()) {
                const patientData = patientDoc.data();
                appointmentsWithPatientName.push({
                    ...appointmentData,
                    patientName: `${patientData.firstName} ${patientData.lastName}`, // Adding patient's name
                });
            } else {
                appointmentsWithPatientName.push(appointmentData); // In case patient details are missing
            }
        }

        appointmentsWithPatientName.sort((a, b) => new Date(a.date) - new Date(b.date));      
        setAppointmentDetails(appointmentsWithPatientName);
    } catch (error) {
        console.error("Error fetching appointments: ", error);
        alert(`Error fetching appointments: ${error.message}`);
    } finally {
        setIsLoading(false); // Always turn off loading indicator
    }
      }, []);
    
    useEffect(() => {
        if (selectedAppointmentStatus) {
            fetchAppointments(selectedAppointmentStatus);
        }
    }, [selectedAppointmentStatus, fetchAppointments]);

    const handleSearch = async () => {
      setIsLoading(true);
      const fetchedPatientDetails = await searchPatientByName(firstName.trim(), lastName.trim());
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
        let error = '';
        if (name === 'height' && !validateHeight(value)) {
            error = 'Height is invalid.';
        } else if (name === 'weight' && !validateWeight(value)) {
            error = 'Weight is invalid.';
        } else if (name === 'bloodPressure' && !validateBloodPressure(value)) {
            error = 'Blood pressure is invalid.';
        } else if ((name === 'allergies' || name === 'familyMedicalHistory') && !value.trim()) {
            error = `${name} cannot be empty.`;
        }

        // Update validation error state
        setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error,
        }));
    };
    const handleBackToSelection = () => {
        setSelectedAppointmentStatus('');
        setAppointmentDetails(null); // Optionally clear any previously loaded appointment details
    };
    function validateHeight(height) {
        return /^([1-9]\d*(\.\d+)?|0\.\d+)$/.test(height);
      }
      
      function validateWeight(weight) {
        return /^([1-9]\d*(\.\d+)?|0\.\d+)$/.test(weight);
      }
      
      function validateBloodPressure(bp) {
        return /^\d{2,3}\/\d{2,3}$/.test(bp);
      }
      
      function validateText(input) {
        return input.length <= 200; // Example max length
      }
      
    const handleVitalsSubmit = async (appointmentId) => {
        const appointmentToUpdate = appointmentDetails.find(appt => appt.appointmentId === appointmentId);
        if (
            !validateHeight(appointmentToUpdate.height) ||
            !validateWeight(appointmentToUpdate.weight) ||
            !validateBloodPressure(appointmentToUpdate.bloodPressure) ||
            !validateText(appointmentToUpdate.allergies) ||
            !validateText(appointmentToUpdate.familyMedicalHistory)
          ) {
            alert('Please check your inputs for errors.');
            return;
          }
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
            const remainingAppointments = appointmentDetails.filter(appt => appt.appointmentId !== appointmentId);
            setAppointmentDetails(remainingAppointments);
        } catch (error) {
            console.error('Error updating appointment status: ', error);
            alert('Failed to update appointment status.');
        }
    };
    const hasCompleteVitals = (appointment) => {
        const requiredVitals = ['height', 'weight', 'bloodPressure', 'allergies', 'familyMedicalHistory'];
        return requiredVitals.every(vital => appointment[vital] && appointment[vital].trim() !== '');
    };    

    const handlePendingAppointments=()=>{
        navigate('/nurseAppointmentsView');
    }
    const handleAcceptedAppointments=()=>{
        navigate('/nurseAcceptedAppointmentsView');
    }
    const handleEquipmentAppointments=()=>{
        navigate('/nurseEditEquipmentBookings');
    }

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
                                    <p>Appointment ID: {appointment.appointmentId}</p>
                                    <p> Patient Name:{appointment.patientName}</p>
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
                                            <div className="vitalsForm">
                                                {/* Vitals form fields and submit button */}
                                                <h3>Fill Additional Patient Details</h3>
                                                <div className="formRow"><div className="formGroup"><label for="height">Height (feet)</label><input type="text" name="height" placeholder="Height (6.25)" value={appointment.height || ''} onChange={(e) => handleVitalsChange(appointment.appointmentId, 'height', e.target.value)} className={!validateHeight(appointment.height) ? 'inputError' : ''}/>{validationErrors.height && <div className="error">{validationErrors.height}</div>}</div></div>
                                                <div className="formRow"><div className="formGroup"><label for="weight">Weight (Lbs)</label><input type="text" name="weight" placeholder="Weight (150)" value={appointment.weight || ''} onChange={(e) => handleVitalsChange(appointment.appointmentId, 'weight', e.target.value)} className={!validateWeight(appointment.height) ? 'inputError' : ''}/>{validationErrors.weight && <div className="error">{validationErrors.weight}</div>}</div></div>
                                                <div className="formRow"><div className="formGroup"><label for="bloodPressure">Blood Pressure (mmHg)</label><input type="text" name="bloodPressure" placeholder="Blood Pressure (135/85)" value={appointment.bloodPressure || ''} onChange={(e) => handleVitalsChange(appointment.appointmentId, 'bloodPressure', e.target.value)} className={!validateBloodPressure(appointment.bloodPressure) ? 'inputError' : ''}/>{validationErrors.bloodPressure && <div className="error">{validationErrors.bloodPressure}</div>}</div></div>
                                                <div className="formRow"><div className="formGroup"><label for="allergies">Allergies</label><textarea className="textareaField"  name="allergies" placeholder="Allergies" value={appointment.allergies || ''} onChange={(e) => handleVitalsChange(appointment.appointmentId, 'allergies', e.target.value)} />{validationErrors.allergies && <div className="error">{validationErrors.allergies}</div>}</div></div>
                                                <div className="formRow"><div className="formGroup"><label for="familyMedicalHistory">Family Medical History</label><textarea className="textareaField"  name="familyMedicalHistory" placeholder="Family Medical History" value={appointment.familyMedicalHistory || ''} onChange={(e) => handleVitalsChange(appointment.appointmentId, 'familyMedicalHistory', e.target.value)} />{validationErrors.familyMedicalHistory && <div className="error">{validationErrors.familyMedicalHistory}</div>}</div></div>
                                                <button onClick={() => handleVitalsSubmit(appointment.appointmentId)}>Submit Details</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : !isLoading && (
                            <p>Search for a patient with First Name and Last Name to see their appointments.</p>
                        )}
                    </>
                ) : (
                    <div className="appointmentSelectionContainer">
                        <button onClick={() => handleAppointmentSelection('Pending')} className={selectedAppointmentStatus === 'Pending' ? 'selectionButton active' : 'selectionButton'} >Pending Appointments</button>
                        <button onClick={() => handleAppointmentSelection('Accepted')} className={selectedAppointmentStatus === 'Accepted' ? 'selectionButton active' : 'selectionButton'}>Accepted Appointments</button>
                        <button onClick={handlePendingAppointments} className="selectionButton">View Pending Appointments</button>
                        <button onClick={handleAcceptedAppointments} className="selectionButton">View Accepted Appointments</button>
                        <button onClick={handleEquipmentAppointments} className="selectionButton">Edit Equipment Appointments</button>
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
    for (const dataVal of querySnapshot.docs) {
        const appointmentData = { appointmentId: dataVal.id, ...dataVal.data() };
        const patientRef = doc(db, "users", appointmentData.patientId);
        const patientDoc = await getDoc(patientRef);
        if (patientDoc.exists()) {
          const patientData = patientDoc.data();
          appointments.push({
            ...appointmentData,
            patientName: `${patientData.firstName} ${patientData.lastName}`, 
          });
        } else {
          appointments.push(appointmentData);
        }
      }
      return appointments;
  }
  

export default NurseDashboard;



