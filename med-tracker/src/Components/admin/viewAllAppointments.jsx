import React, { useEffect, useState } from 'react';
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import '../../style.css';
import { useNavigate } from 'react-router-dom';

const ViewAllAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {

        const fetchAppointments = async () => {
            const querySnapshot = await getDocs(collection(db, "appointments"));
            const appointmentsPromises = querySnapshot.docs.map(async (document) => {
                const appointmentData = document.data();
                const userDocRef = doc(db, "users", appointmentData.patientId); // 使用patientId
                const userSnapshot = await getDoc(userDocRef);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();

                    return {
                        id: doc.id,
                        ...appointmentData,
                        patientName: `${userData.firstName} ${userData.lastName}`
                    };
                } else {

                    return { id: doc.id, ...appointmentData };
                }
            });

            const appointmentsData = await Promise.all(appointmentsPromises);
            setAppointments(appointmentsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
        };

        fetchAppointments();
    }, []);

    const groupAppointmentsByStatus = (appointments) => {
        return appointments.reduce((acc, appointment) => {
            const { status } = appointment;
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(appointment);
            return acc;
        }, {});
    };

    const groupedAppointments = groupAppointmentsByStatus(appointments);

    const backAdminDashboard=()=>{
        navigate("/adminDashboard");
    }

    return (
        <div className="setAccountDetailsContainer">
            <header className="fixed-header">
                <h1>All Appointments</h1>
            </header>
            <main className="content">
                {Object.keys(groupedAppointments).length > 0 ? (
                    Object.entries(groupedAppointments).map(([status, appointmentsGroup]) => (
                        <div key={status}>
                            <Typography variant="h6" style={{ marginTop: '20px', textTransform: 'capitalize' }}>{status}</Typography>
                            {appointmentsGroup.map((appointment) => (
                                <Accordion key={appointment.id} className="appointmentAccordion">
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>{appointment.date} - {appointment.patientName}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography>Date: {appointment.date}</Typography>
                                        <Typography>Time: {appointment.time}</Typography>
                                        <Typography>Department: {appointment.departmentName}</Typography>
                                        <Typography>Doctor: {appointment.doctorName}</Typography>
                                        <Typography>Status: {appointment.status}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </div>
                    ))
                ) : (
                    <Typography>No appointments found.</Typography>
                )}
            </main>
            <footer className = "footer">
            <button className="dashboardButton" onClick={backAdminDashboard}>Admin Dashboard</button>
        </footer>
        </div>
    );
};

export default ViewAllAppointments;
