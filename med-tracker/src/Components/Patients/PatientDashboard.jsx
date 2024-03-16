import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { auth } from '../../firebase';
import {signOut} from "firebase/auth";
import {addAppointment, getAppointments} from "../service/appointmentService";
import AppointmentForm from "../service/appointmentForm";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const PatientDashboard = () => {
    const navigate = useNavigate();
    const handleSetupAccount=()=>{
        navigate('/editPatientAccount');
    }

    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                await fetchAppointments();
            } catch (error) {
                console.error('unable to fetch appointment', error);
            }
        })();
    }, []);

    const fetchAppointments = async () => {
        const loadedAppointments = await getAppointments();
        setAppointments(loadedAppointments.map(appointment => ({
            title: `${appointment.departmentName} - ${appointment.doctorName}`,
            start: `${appointment.date}T${appointment.time}`,

        })));
    };

    const handleSaveAppointment = async (appointmentData) => {
        console.log('Saving new appointment:', appointmentData);
        try {
            await addAppointment(appointmentData);
            await fetchAppointments();
        } catch (error) {
            console.error("Failed to save appointment:", error);

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
    
    return(
        <div >
            <header className="fixed-header"><h1>Welcome to Patient Dashboard</h1></header>
            
            <main className="content">
                <button onClick={handleSetupAccount}>Edit Account</button>
            </main>

            <AppointmentForm onSaveAppointment={handleSaveAppointment} />
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={appointments}
            />
    
            <footer className = "footer">
            <button className="Logout" onClick={handleSignOut}>
                Log Out
            </button>
            </footer>
            
        </div>
    )
    
};

export default PatientDashboard;