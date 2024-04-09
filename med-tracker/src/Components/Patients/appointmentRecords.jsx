import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { AuthContext } from '../../context/authContext';
import '../../style.css';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

const AppointmentRecords = () => {
    const { currentUser } = useContext(AuthContext);
    //const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [patientInfo, setPatientInfo] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        phoneNumber: '',
        email: '',
        address: ''
    });
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.uid) {
            const fetchUserData = async () => {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userSnapshot = await getDoc(userDocRef);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setPatientInfo(prev => ({
                        ...prev,
                        ...userData
                    }));
                } else {
                    console.log("No such document!");
                }
            };

            fetchUserData();
        } else {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (currentUser && currentUser.uid) {
                const appointmentsQuery = query(collection(db, "appointments"), where("patientId", "==", currentUser.uid));
                const querySnapshot = await getDocs(appointmentsQuery);
                const appointmentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                appointmentsData.sort((a, b) => new Date(a.date) - new Date(b.date)); 
                setAppointments(appointmentsData);
            }
        };

        fetchAppointments();
    }, [currentUser]);

    const backPatientDashboard=()=>{
        navigate("/patientDashboard");
    }

    const handleDialogOpen = (appointment) => {
        setSelectedAppointment(appointment);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };


    return (
        <div className="equipmentContainer">
        <header className="fixed-header">
            <h1>View your Appointments - {patientInfo.firstName} {patientInfo.lastName}</h1>
        </header>
        <main className="content">
            <h1>Appointment Records</h1>
            <table className="appointmentsTable">
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Department</th>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th>Details</th>
                </tr>
                </thead>
                <tbody>
                {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                        <td>{appointment.date}</td>
                        <td>{appointment.time}</td>
                        <td>{appointment.departmentName}</td>
                        <td>{appointment.doctorName}</td>
                        <td>{appointment.status}</td>
                        <td>
                            <Button variant="outlined" onClick={() => handleDialogOpen(appointment)}>Details</Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>


        </main>
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Appointment Details</DialogTitle>
                <DialogContent>
                    {selectedAppointment && (
                        <>
                            <DialogContentText>Height: {selectedAppointment.height} inches</DialogContentText>
                            <DialogContentText>Weight: {selectedAppointment.weight} lbs</DialogContentText>
                            <DialogContentText>Blood Pressure: {selectedAppointment.bloodPressure}</DialogContentText>
                            <DialogContentText>Allergies: {selectedAppointment.allergies || "No Allergies"}</DialogContentText>
                            <DialogContentText>Family Medical History: {selectedAppointment.familyMedicalHistory || "None"}</DialogContentText>
                            <DialogContentText>Diagnosis: {selectedAppointment.diagnosis}</DialogContentText>
                            <DialogContentText>Treatment Plan: {selectedAppointment.treatmentPlan || "No need"}</DialogContentText>

                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Close</Button>
                </DialogActions>
            </Dialog>
        <footer className="footer">
            <button className="dashboardButton" onClick={backPatientDashboard}>Patient Dashboard</button>
        </footer>
    </div>
    );
};

export default AppointmentRecords;
