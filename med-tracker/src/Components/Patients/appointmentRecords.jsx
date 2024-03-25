import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { AuthContext } from '../../context/authContext';
import '../../style.css';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
                setAppointments(appointmentsData);
            }
        };

        fetchAppointments();
    }, [currentUser]);

    const backPatientDashboard=()=>{
        navigate("/patientDashboard");
    }

    const isFutureAppointment = (appointmentDate) => {
        const today = new Date();
        const appointment = new Date(appointmentDate);
        return appointment > today;
    };
    const renderDetailWithUnit = (value, unit) => {
        return value ? `${value} ${unit}` : "Yet to be filled";
      };

    const groupAppointmentsByStatus = (appointments) => {
        return appointments.reduce((acc, appointment) => {
            (acc[appointment.status] = acc[appointment.status] || []).push(appointment);
            return acc;
        }, {});
    };

    const groupedAppointments = groupAppointmentsByStatus(appointments);


    return (
        <div className="setAccountDetailsContainer">
        <header className="fixed-header">
            <h1>View your Appointments - {patientInfo.firstName} {patientInfo.lastName}</h1>
        </header>
        <main className="content">
            <section className="appointments">
                <h2>Appointments History</h2>
                {Object.keys(groupedAppointments).length > 0 ? (
                    Object.entries(groupedAppointments).map(([status, appointments]) => (
                        <div key={status}>
                                <Typography variant="h5" style={{ marginTop: '20px' }}>
                                    <span className={`statusBadge ${status.toLowerCase()}`}>
                                        {status === 'Finished' ? 'Diagnosis Complete' : status}
                                    </span>
                                </Typography>
                                {appointments.map((appointment, index) => (
                                    <Accordion key={appointment.id} className={isFutureAppointment(appointment.date) ? "futureAppointment" : "pastAppointment"}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography>Appointment {index + 1} - {appointment.date}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography>Date: {appointment.date}</Typography>
                                            <Typography>Time: {appointment.time}</Typography>
                                            <Typography>Department: {appointment.departmentName}</Typography>
                                            <Typography>Doctor: {appointment.doctorName}</Typography>
                                            <Typography>Status: {appointment.status}</Typography>
                                            <Typography>Height: {renderDetailWithUnit(appointment.height, 'feet')}</Typography>
                                            <Typography>Weight: {renderDetailWithUnit(appointment.weight, 'Lbs')}</Typography>
                                            <Typography>BloodPressure: {renderDetailWithUnit(appointment.bloodPressure, 'mmHg')}</Typography>
                                            <Typography>Diagnosis: {appointment.diagnosis || "Yet to be diagnosed"}</Typography>
                                            <Typography>Treatment: {appointment.treatmentPlan || "Yet to be determined"}</Typography>
                                            {/* Add more fields as needed */}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                        </div>
                    ))
                ) : (
                    <p>No appointments found.</p>
                )}
            </section>
        </main>
        <footer className="footer">
            <button className="dashboardButton" onClick={backPatientDashboard}>Patient Dashboard</button>
        </footer>
    </div>
    );
};

export default AppointmentRecords;
