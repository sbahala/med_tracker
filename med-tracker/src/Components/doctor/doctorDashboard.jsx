import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from "firebase/auth";
import { db } from "../../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    //const [patientRecord, setPatientRecord] = useState(null);
    const [appointmentDetails, setAppointmentDetails] = useState([]);
    const [patientUid, setPatientUid] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatmentPlan, setTreatmentPlan] = useState('');

    const handleSearch = async () => {
        // Similar to NurseDashboard's search functionality
        // Fetch patient record from the 'patientRecords' collection
        const patientRecordsRef = collection(db, "users");
        const q = query(patientRecordsRef, where("firstName", "==", firstName), where("lastName", "==", lastName), where("role", "==", "patient"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const patientUid = querySnapshot.docs[0].id;
            setPatientUid(patientUid);
            const appointmentsRef = collection(db, "appointments");
            const qAppointments = query(appointmentsRef, where("patientId", "==", patientUid));
            const appointmentsSnapshot = await getDocs(qAppointments);

            const appointments = appointmentsSnapshot.docs.map(doc => ({ appointmentId: doc.id, ...doc.data() }));
            setAppointmentDetails(appointments);
        } else {
            alert('No patient records found.');
            setAppointmentDetails([]);
            setPatientUid('');
        }
    };

    const handleSubmitUpdates = async () => {
        if (!patientUid) {
            alert('No patient selected');
            return;
        }
        try {
            await Promise.all(appointmentDetails.map(appointment => {
                const appointmentDocRef = doc(db, "appointments", appointment.appointmentId);
                return updateDoc(appointmentDocRef, {
                    diagnosis,
                    treatmentPlan
                });
            }));
            alert('Patient record updated successfully');
        } catch (error) {
            console.error('Error updating patient record: ', error);
            alert('Failed to update patient record');
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
            <header className="fixed-header"><h1>Welcome to Doctor Dashboard</h1></header>
            <main className="content">
                <h2>Patient Record</h2>
                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                <button onClick={handleSearch}>Search Patient</button>

                {appointmentDetails.length > 0 && (
                    <div>
                        <h2>Appointment Details</h2>
                        {appointmentDetails.map((appointment, index) => (
                            <div key={index}>
                                <p>Appointment ID: {appointment.appointmentId}</p>
                                <p>Date: {appointment.date}</p>
                                <p>Time: {appointment.time}</p>
                                <p>Height: {appointment.height}</p>
                                <p>Weight: {appointment.weight}</p>
                                <p>Allergies: {appointment.allergies}</p>
                                <p>Blood Pressure: {appointment.bloodPressure}</p>
                                <p>Family Medical History : {appointment.familyMedicalHistory}</p>
                                {/* Include other appointment details as needed */}
                            </div>
                        ))}
                        <textarea className="textareaField" placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
                        <textarea className="textareaField" placeholder="Treatment Plan" value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} />
                        <button onClick={handleSubmitUpdates}>Update Appointment Record</button>
                    </div>
                )}
            </main>
            <footer className = "footer">
                <button className="Logout" onClick={handleSignOut}>Log Out</button>
            </footer>
        </div>
    );
};

export default DoctorDashboard;
