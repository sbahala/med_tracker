import React, { useState,useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from "firebase/auth";
import { db } from "../../firebase";
import { collection, query, where, getDocs, updateDoc, doc , getDoc} from 'firebase/firestore';

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
    const [isDiagnosisSubmitted, setIsDiagnosisSubmitted] = useState(false);
    const [finishedAppointments, setFinishedAppointments] = useState([]);
    const [viewingAppointmentDetails, setViewingAppointmentDetails] = useState(null);

    const handlePendingAppointments=()=>{
        navigate('/doctorPendingAppointmentsView');
    }
    const handleOntimeAppointments=()=>{
        navigate('/doctorOntimeAppointments');
    }
    const handleCompletedAppointments=()=>{
        navigate('/doctorCompletedAppointments');
    }
    const handleViewEquipments=()=>{
        navigate('/doctorEquipmentView');
    }

    const fetchAppointments = useCallback(async (status) => {
        setIsLoading(true);
        try {
          const q = query(collection(db, "appointments"), where("status", "==", status));
          const querySnapshot = await getDocs(q);
          let appointments = [];

            for (let docSnapshot of querySnapshot.docs) {
                const appointmentData = { id: docSnapshot.id, ...docSnapshot.data() };
                // Fetch patient details
                const patientRef = doc(db, "users", appointmentData.patientId);
                const patientSnap = await getDoc(patientRef);
                if (patientSnap.exists()) {
                    // Add patient name to the appointment data
                    appointmentData.patientName = `${patientSnap.data().firstName} ${patientSnap.data().lastName}`;
                } else {
                    // Handle case where patient data is not found
                    appointmentData.patientName = "Unknown";
                }
                appointments.push(appointmentData);
            }

            appointments.sort((a, b) => new Date(a.date) - new Date(b.date));  
          if (status === 'Pending') {
            setPendingAppointments(appointments.filter(appt => appt.status === 'Pending'));
          } else if (status === 'OnTime') {
            setOnTimeAppointments(appointments.filter(appt => appt.status === 'OnTime'));
          } else if (status === 'Finished') {
            setFinishedAppointments(appointments.filter(appt => appt.status === 'Finished'));
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
          alert(`Error fetching appointments: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }, []);
    
      useEffect(() => {
        if (selectedAppointmentType) {
          fetchAppointments(selectedAppointmentType);
        }
      }, [selectedAppointmentType, fetchAppointments]);

    const handleSearch = async (appointmentType) => {
        if (!appointmentType) {
            console.error("handleSearch was called without an appointmentType");
            return;
          }
        setIsLoading(true);
        const patientRecordsRef = collection(db, "users");
        const q = query(patientRecordsRef, where("firstName", "==", firstName.trim()), where("lastName", "==", lastName.trim()), where("role", "==", "patient"));
        const querySnapshot = await getDocs(q);
        //let appointments = [];
        if (!querySnapshot.empty) {
            const patientUid = querySnapshot.docs[0].id;
            const appointmentsRef = collection(db, "appointments");
            const qAppointments = query(appointmentsRef, where("patientId", "==", patientUid),  where("status", "==", appointmentType));
            const appointmentsSnapshot = await getDocs(qAppointments);

            let appointments = [];
            for (let docSnapshot of appointmentsSnapshot.docs) {
                const appointmentData = { appointmentId: docSnapshot.id, ...docSnapshot.data() };
                // Fetch patient details
                const patientRef = doc(db, "users", appointmentData.patientId);
                const patientSnap = await getDoc(patientRef);
                if (patientSnap.exists()) {
                    // Add patient name to the appointment data
                    appointmentData.patientName = `${patientSnap.data().firstName} ${patientSnap.data().lastName}`;
                } else {
                    // Handle case where patient data is not found
                    appointmentData.patientName = "Unknown";
                }
                appointments.push(appointmentData);
            }

            if (appointmentType === 'Pending') {
                setPendingAppointments(appointments.filter(appt => appt.status === 'Pending'));
                setOnTimeAppointments([]);
              } else if (appointmentType === 'OnTime') {
                setOnTimeAppointments(appointments.filter(appt => appt.status === 'OnTime' && appt.status !== 'Finished'));
                setPendingAppointments([]);
              } else if (appointmentType === 'Finished') {
                setFinishedAppointments(appointments.filter(appt => appt.status === 'Finished'));
                setPendingAppointments([]);
                setOnTimeAppointments([]);
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
        setIsDiagnosisSubmitted(false);
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
            setIsDiagnosisSubmitted(true);
            //setSelectedOnTimeAppointment(null);
            //setSelectedOnTimeDiagnosis('');
            //setSelectedOnTimeTreatmentPlan('');
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
        //fetchAppointments(type === 'Completed' ? 'Finished' : type);
        //setAppointmentDetails([]);
        if (type === 'Finished') {
            fetchAppointments('Finished');
        } else {
            fetchAppointments(type);
        }
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
    const handleCompleteDiagnosis = async (appointmentId) => {
        if (!appointmentId) {
            alert('No appointment selected to complete diagnosis.');
            return;
        }
    
        const appointmentRef = doc(db, "appointments", appointmentId);
        try {
            await updateDoc(appointmentRef, {
                status: 'Finished',
            });
            alert('Diagnosis completed successfully.');
            //setIsDiagnosisSubmitted(false);
            // Update the appointment in the onTimeAppointments list to reflect the new status
            /*const updatedOnTimeAppointments = onTimeAppointments.map(appt => {
                if (appt.appointmentId === appointmentId) {
                    return { ...appt, status: 'Finished' };
                }
                return appt;
            });
            setOnTimeAppointments(updatedOnTimeAppointments);*/
            const remainingOnTimeAppointments = onTimeAppointments.filter(appt => appt.appointmentId !== appointmentId);
            setOnTimeAppointments(remainingOnTimeAppointments);
            
            setIsDiagnosisSubmitted(false);
            
            // Clear the selected appointment details
            setSelectedOnTimeAppointment(null);
            setSelectedOnTimeDiagnosis('');
            setSelectedOnTimeTreatmentPlan('');
        } catch (error) {
            console.error('Error completing diagnosis: ', error);
            alert('Failed to complete diagnosis.');
        }
    };
    

    return (
        <div>
            <header className="fixed-header"><h1>Welcome to Doctor Dashboard</h1></header>
            <main className="content">
            {showAppointmentButtons && (
                <div className="appointmentSelectionContainer">
                    <button onClick={() => handleAppointmentTypeSelection('Pending')} className={selectedAppointmentType === 'Pending' ? 'selectionButton active' : 'selectionButton'} >Pending Appointments</button>
                    <button onClick={() => handleAppointmentTypeSelection('OnTime')} className={selectedAppointmentType === 'OnTime' ? 'selectionButton active' : 'selectionButton'}>OnTime Appointments</button>
                    <button onClick={() => handleAppointmentTypeSelection('Finished')} className={selectedAppointmentType === 'Finished' ? 'selectionButton active' : 'selectionButton'}>Completed Appointments</button>
                    <button onClick={handlePendingAppointments} className="selectionButton">View Pending Appointments</button>
                    <button onClick={handleOntimeAppointments} className="selectionButton">View OnTime Appointments</button>
                    <button onClick={handleCompletedAppointments} className="selectionButton">View Completed Appointments</button>
                    <button onClick={handleViewEquipments} className="selectionButton">View Equipment Status</button>
                </div>
            )}
            
            {selectedAppointmentType && (
                <>
                    <h2>{selectedAppointmentType === 'Finished' ? 'Diagnosis Completed' : `${selectedAppointmentType} Appointments`}</h2>
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
                                                <p>Patient Name: {appointment.patientName}</p>
                                                <p>Date: {appointment.date}</p>
                                                <p>Time: {appointment.time}</p>
                                                <p>Height: {appointment.height || "Yet to be filled"}</p>
                                                <p>Weight: {appointment.weight || "Yet to be filled"}</p>
                                                <p>Allergies: {appointment.allergies || "Yet to be filled"}</p>
                                                <p>Blood Pressure: {appointment.bloodPressure || "Yet to be filled"}</p>
                                                <p>Family Medical History : {appointment.familyMedicalHistory || "Yet to be filled"}</p>
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
                                        <p>Patient Name: {appointment.patientName}</p>
                                        <p>Date: {appointment.date}</p>
                                        <p>Time: {appointment.time}</p>
                                        <p>Height: {appointment.height || "Yet to be filled"}</p>
                                        <p>Weight: {appointment.weight || "Yet to be filled"}</p>
                                        <p>Allergies: {appointment.allergies || "Yet to be filled"}</p>
                                        <p>Blood Pressure: {appointment.bloodPressure || "Yet to be filled"}</p>
                                        <p>Family Medical History : {appointment.familyMedicalHistory || "Yet to be filled"}</p>
                                        <button onClick={() => handleSelectOnTimeAppointment(appointment)} >Edit Diagnosis</button>
                                        {isDiagnosisSubmitted && selectedOnTimeAppointment && selectedOnTimeAppointment.appointmentId === appointment.appointmentId && (
                                            <button
                                                onClick={() => handleCompleteDiagnosis(appointment.appointmentId)}
                                                className="button completeDiagnosisButton"
                                            >
                                                Completed Diagnosis
                                            </button>
                                        )}
                                    </div>
                                        
                                </div>                    
                            </div>
                            ))}
                        </div>
                        )}
                        {selectedAppointmentType === 'OnTime' && selectedOnTimeAppointment && !isDiagnosisSubmitted &&(
                            <div>
                                <h3>Enter Diagnosis and Treatment Plan</h3>
                                <div className="formRow"><div className="formGroup"><label for="diagnosis">Diagnosis</label><textarea className="textareaField" name ="diagnosis"placeholder="Enter Diagnosis Here " value={selectedOnTimeDiagnosis} onChange={handleChangeDiagnosis} /></div></div>
                                <div className="formRow"><div className="formGroup"><label for="treatmentPlan">Treatment Plan</label><textarea className="textareaField" name="treatmentPlan"placeholder="Enter Treatment Plan Here " value={selectedOnTimeTreatmentPlan} onChange={handleChangeTreatmentPlan} /></div></div>
                                <button onClick={handleUpdateOnTimeAppointment}>Submit Diagnosis and Treatment Plan</button>
                            </div>
                        )}
                        {selectedAppointmentType === 'Finished' && finishedAppointments.length > 0 && (
                            <div>
                                {finishedAppointments.map((appointment, index) => (
                                    <div key={appointment.appointmentId} className="appointmentDetailsContainer" style={{marginBottom: '10px'}}>
                                        <p>Appointment ID: {appointment.appointmentId} - Patient Name: {appointment.patientName}</p>
                                        <button onClick={() => setViewingAppointmentDetails(appointment)}>View Details</button>
                                    </div>
                                ))}
                                {viewingAppointmentDetails && (
                                    <div style={{marginTop: '20px', border: '1px solid #ccc', padding: '10px'}}>
                                        <h3>Appointment Details:</h3>
                                        <p>Appointment ID: {viewingAppointmentDetails.appointmentId}</p>
                                        <p>Patient Name: {viewingAppointmentDetails.patientName}</p>
                                        <p>Date: {viewingAppointmentDetails.date}</p>
                                        <p>Time: {viewingAppointmentDetails.time}</p>
                                        <p>Height: {viewingAppointmentDetails.height || "N/A"}</p>
                                        <p>Weight: {viewingAppointmentDetails.weight || "N/A"}</p>
                                        <p>Allergies: {viewingAppointmentDetails.allergies || "N/A"}</p>
                                        <p>Blood Pressure: {viewingAppointmentDetails.bloodPressure || "N/A"}</p>
                                        <p>Family Medical History: {viewingAppointmentDetails.familyMedicalHistory || "N/A"}</p>
                                        <p>Diagnosis: {viewingAppointmentDetails.diagnosis || "N/A"}</p>
                                        <p>TreatMent Plan: {viewingAppointmentDetails.treatmentPlan || "N/A"}</p>
                                        <button onClick={() => setViewingAppointmentDetails(null)}>Close Details</button>
                                    </div>
                                )}
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
