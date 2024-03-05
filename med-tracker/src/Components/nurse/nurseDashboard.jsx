import React ,{ useState }from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../../firebase";
import { auth } from '../../firebase';
import { doc,updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from 'firebase/firestore';

const NurseDashboard = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [patientDetails, setPatientDetails] = useState(null);
    const [appointmentDetails, setAppointmentDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [additionalDetails, setAdditionalDetails] = useState({
        height: '',
        weight: '',
        bloodPressure: '',
        allergies: '',
        familyMedicalHistory: '',
    });
  
    const handleSearch = async () => {
      setIsLoading(true);
      const fetchedPatientDetails = await searchPatientByName(firstName, lastName);
      if (fetchedPatientDetails.length > 0) { // Assuming there can be multiple patients with the same name
        // For simplicity, taking the first match. You may want to handle multiple matches differently.
        const patient = fetchedPatientDetails[0];
        setPatientDetails(patient);
        const fetchedAppointmentDetails = await fetchAppointmentDetailsByPatientId(patient.uid);
        setAppointmentDetails(fetchedAppointmentDetails);
      }else{
        alert('No patient records found.');
        setPatientDetails(null);
        setAppointmentDetails(null);
      }
      setIsLoading(false);
    };


    const handleAdditionalDetailsChange = (e) => {
        const { name, value } = e.target;
        setAdditionalDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };
    const handleAdditionalDetailsSubmit = async () => {
        if (!appointmentDetails || appointmentDetails.length === 0) {
            alert('No appointments found for the selected patient');
            return;
        }
        try {
            await Promise.all(appointmentDetails.map(async (appointment) => {
                const appointmentRef = doc(db, "appointments", appointment.appointmentId);
                await updateDoc(appointmentRef, additionalDetails);
            }));
            alert('Appointment records updated successfully');
        } catch (error) {
            console.error('Error updating appointment records: ', error);
            alert('Failed to update appointment records');
        }
    };
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    return (
      <div>
         <header className="fixed-header"><h1>Welcome to Nurse Dashboard</h1></header>
        <main className="content">
        <h2>Patient Record</h2>
        <label className="formLabel"> First Name</label><input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <label className="formLabel"> Last Name</label><input type="text" placeholder="Last Name"value={lastName} onChange={(e) => setLastName(e.target.value)}/>
        <button onClick={handleSearch} disabled={isLoading}>
        Search
        </button>
    

        {isLoading && <p>Loading...</p>}

        {appointmentDetails && appointmentDetails.length > 0 ? (
        <div>
            <h2>Appointment Details</h2>
            {appointmentDetails.map((appointment, index) => (
            <div key={index}>
                <p>Appointment ID: {appointment.appointmentId}</p>
                <p>Date: {appointment.date}</p>
                <p>Time: {appointment.time}</p>
                <p>Department: {appointment.departmentName}</p>
                <p>Doctor: {appointment.doctorName}</p>
                <p>Status: {appointment.status}</p>
            </div>
            ))}
        </div>
        ) : (
        <p>Search for patient name and if found fill the required details</p>
        )
        }
        {/* Additional Details Form */}
        {patientDetails && (
                <div>
                    <h2>Fill Additional Patient Details</h2>
                    <input type="text" name="height" placeholder="Height (feet)" value={additionalDetails.height} onChange={handleAdditionalDetailsChange} />
                    <input type="text" name="weight" placeholder="Weight (Lbs)" value={additionalDetails.weight} onChange={handleAdditionalDetailsChange} />
                    <input type="text" name="bloodPressure" placeholder="Blood Pressure (mmHg)" value={additionalDetails.bloodPressure} onChange={handleAdditionalDetailsChange} />
                    <br></br><textarea className="textareaField" name="allergies" placeholder="Allergies" value={additionalDetails.allergies} onChange={handleAdditionalDetailsChange} />
                    <br></br><textarea className="textareaField" name="familyMedicalHistory" placeholder="Family Medical History"  value={additionalDetails.familyMedicalHistory}  onChange={handleAdditionalDetailsChange}/>
                    <br></br><button onClick={handleAdditionalDetailsSubmit}>
                        Submit Details
                    </button>
                </div>
            )}
        </main>
        <footer className = "footer">
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
  
  async function fetchAppointmentDetailsByPatientId(patientId) {
    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, where("patientId", "==", patientId));
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
        if (doc.data().patientId) {
            appointments.push(doc.data());
          }
    });
    return appointments;
  }
  

export default NurseDashboard;