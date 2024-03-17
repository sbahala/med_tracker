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
    const [selectedOnTimeAppointment, setSelectedOnTimeAppointment] = useState(null);
    const [selectedOnTimeDiagnosis, setSelectedOnTimeDiagnosis] = useState('');
    const [selectedOnTimeTreatmentPlan, setSelectedOnTimeTreatmentPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAppointmentType, setSelectedAppointmentType] = useState('');
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [onTimeAppointments, setOnTimeAppointments] = useState([]);
    const [showAppointmentButtons, setShowAppointmentButtons] = useState(true);



    const handleSearch = async (appointmentType) => {
        if (!appointmentType) {
            console.error("handleSearch was called without an appointmentType");
            return;
          }
        setIsLoading(true);
        const patientRecordsRef = collection(db, "users");
        const q = query(patientRecordsRef, where("firstName", "==", firstName), where("lastName", "==", lastName), where("role", "==", "patient"));
        const querySnapshot = await getDocs(q);
        let appointments = [];
        if (!querySnapshot.empty) {
            const patientUid = querySnapshot.docs[0].id;
            const appointmentsRef = collection(db, "appointments");
            const qAppointments = query(appointmentsRef, where("patientId", "==", patientUid),  where("status", "==", appointmentType));
            const appointmentsSnapshot = await getDocs(qAppointments);

            appointments = appointmentsSnapshot.docs.map(doc => ({ appointmentId: doc.id, ...doc.data() }));
            if (appointmentType === 'Pending') {
                setPendingAppointments(appointments.filter(appt => appt.status === 'Pending'));
                setOnTimeAppointments([]);
              } else if (appointmentType === 'OnTime') {
                setOnTimeAppointments(appointments.filter(appt => appt.status === 'OnTime'));
                setPendingAppointments([]);
              }
            //setAppointmentDetails(appointments);
        } else {
            alert('No patient records found.');
        }
        //setAppointmentDetails(appointments);
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
    const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
        if (typeof appointmentId === 'undefined' || typeof newStatus === 'undefined') {
            console.error('Invalid appointmentId or newStatus:', appointmentId, newStatus);
            return;
        }
        const appointmentRef = doc(db, "appointments", appointmentId);
        try {
            await updateDoc(appointmentRef, {
                status: newStatus,
            });
            alert(`Appointment ${newStatus.toLowerCase()} successfully.`);
            if (newStatus === 'Declined' || newStatus === 'Accepted') {
                const updatedAppointments = pendingAppointments.filter(appt => appt.appointmentId !== appointmentId);
                setPendingAppointments(updatedAppointments);
              }
        } catch (error) {
            console.error('Error updating appointment status: ', error);
            alert('Failed to update appointment status.');
        }
    };
    const handleSelectOnTimeAppointment = (appointment) => {
        //setSelectedAppointment(null);
        setSelectedOnTimeAppointment(appointment);
        setSelectedOnTimeDiagnosis(appointment.diagnosis || '');
        setSelectedOnTimeTreatmentPlan(appointment.treatmentPlan || '');
    };
    const handleChangeDiagnosis = (e) => {
        setSelectedOnTimeDiagnosis(e.target.value);
    };

    const handleChangeTreatmentPlan = (e) => {
        setSelectedOnTimeTreatmentPlan(e.target.value);
    };
    const handleUpdateOnTimeAppointment = async () => {
        if (!selectedOnTimeAppointment){
            alert('No on-time appointment selected.');
            return;
        } 
        if (!selectedOnTimeDiagnosis.trim() || !selectedOnTimeTreatmentPlan.trim()) {
            alert('Both diagnosis and treatment plan are required.');
            return;
        }
        const appointmentRef = doc(db, "appointments", selectedOnTimeAppointment.appointmentId);
        try {
            await updateDoc(appointmentRef, {
                diagnosis: selectedOnTimeDiagnosis,
                treatmentPlan: selectedOnTimeTreatmentPlan
            });
            alert('Treatment plan added successfully');
            const updatedOnTimeAppointments = onTimeAppointments.map(appt => {
                if (appt.appointmentId === selectedOnTimeAppointment.appointmentId) {
                    return { ...appt, diagnosis: selectedOnTimeDiagnosis, treatmentPlan: selectedOnTimeTreatmentPlan };
                }
                return appt;
            });
            setOnTimeAppointments(updatedOnTimeAppointments);
            setSelectedOnTimeAppointment(null);
            setSelectedOnTimeDiagnosis('');
            setSelectedOnTimeTreatmentPlan('');
        } catch (error) {
            console.error('Error updating on-time appointment: ', error);
            alert('Failed to update on-time appointment');
        }
    };
    const handleAppointmentTypeSelection = (type) => {
        setSelectedAppointmentType(type);
        setShowAppointmentButtons(false);
        setFirstName('');
        setLastName('');
        //setAppointmentDetails([]);
    };

    const handleBackToSelection = () => {
        setSelectedAppointmentType('');
        setShowAppointmentButtons(true);
        //setAppointmentDetails([]);
        setPendingAppointments([]);
        setOnTimeAppointments([]);
        setSelectedOnTimeAppointment(null);
        setSelectedOnTimeDiagnosis('');
        setSelectedOnTimeTreatmentPlan('');
    };
    

    return (
        <div>
            <header className="fixed-header"><h1>Welcome to Doctor Dashboard</h1></header>
            <main className="content">
            {showAppointmentButtons && (
                <div className="appointmentSelectionContainer">
                    <button onClick={() => handleAppointmentTypeSelection('Pending')} className={selectedAppointmentType === 'Pending' ? 'selectionButton active' : 'selectionButton'} >Pending Appointments</button>
                    <button onClick={() => handleAppointmentTypeSelection('OnTime')} className={selectedAppointmentType === 'OnTime' ? 'selectionButton active' : 'selectionButton'}>OnTime Appointments</button>
                </div>
            )}
            
            {selectedAppointmentType && (
                <>
                    <h2>{selectedAppointmentType} Appointments</h2>
                        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        <button onClick={() => handleSearch(selectedAppointmentType)} disabled={isLoading}>Search</button>
                        {isLoading && <p>Loading...</p>}
                        {pendingAppointments.length > 0 && selectedAppointmentType === 'Pending' && (
                            <div>
                                {pendingAppointments.map((appointment, index) => (
                                    <div key={appointment.appointmentId} className="appointmentDetailsContainer">
                                        <div className="appointmentDetail">
                                            <div>
                                                <p>Appointment ID: {appointment.appointmentId}</p>
                                                <p>Date: {appointment.date}</p>
                                                <p>Time: {appointment.time}</p>
                                                <p>Height: {appointment.height}</p>
                                                <p>Weight: {appointment.weight}</p>
                                                <p>Allergies: {appointment.allergies}</p>
                                                <p>Blood Pressure: {appointment.bloodPressure}</p>
                                                <p>Family Medical History : {appointment.familyMedicalHistory}</p>
                                            </div>
                                            {appointment.status === 'Pending' && (
                                                    <div className="appointmentActions">
                                                        <button onClick={() => handleUpdateAppointmentStatus(appointment.appointmentId, 'Accepted')} className="button acceptButton">Accept</button>
                                                        <button onClick={() => handleUpdateAppointmentStatus(appointment.appointmentId, 'Declined')}className="button declineButton">Decline</button>
                                                    </div>
                                                )}
                                        </div>
                                </div>

                                ))}
                            </div>
                        )}
                        {onTimeAppointments.length > 0 && selectedAppointmentType === 'OnTime' && (
                        <div>
                            {onTimeAppointments.map((appointment, index) => (
                            <div key={appointment.appointmentId} className="appointmentDetailsContainer">
                                <div className="appointmentDetail">
                                    <div>
                                        <p>Appointment ID: {appointment.appointmentId}</p>
                                        <p>Date: {appointment.date}</p>
                                        <p>Time: {appointment.time}</p>
                                        <p>Height: {appointment.height}</p>
                                        <p>Weight: {appointment.weight}</p>
                                        <p>Allergies: {appointment.allergies}</p>
                                        <p>Blood Pressure: {appointment.bloodPressure}</p>
                                        <p>Family Medical History : {appointment.familyMedicalHistory}</p>
                                        <button onClick={() => handleSelectOnTimeAppointment(appointment)} >Enter Diagnosis</button>
                                    </div>
                                        
                                </div>                    
                            </div>
                            ))}
                        </div>
                        )}
                        {selectedAppointmentType === 'OnTime' && selectedOnTimeAppointment && (
                            <div>
                                <h3>Enter Diagnosis and Treatment Plan</h3>
                                <textarea className="textareaField" placeholder="Diagnosis" value={selectedOnTimeDiagnosis} onChange={handleChangeDiagnosis} />
                                <textarea className="textareaField" placeholder="Treatment Plan" value={selectedOnTimeTreatmentPlan} onChange={handleChangeTreatmentPlan} />
                                <button onClick={handleUpdateOnTimeAppointment}>Submit Diagnosis and Treatment Plan</button>    
                            </div>
                        )}
                </>
            )}
            </main>
            <footer className = "footer">
                {selectedAppointmentType && (
                        <button onClick={handleBackToSelection}>Back to Appointment Selection</button>
                    )}
                <button className="Logout" onClick={handleSignOut}>Log Out</button>
            </footer>
        </div>
    );
};

export default DoctorDashboard;
