import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { addAppointment, getAppointments } from "../service/appointmentService";
import AppointmentForm from "../service/appointmentForm";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = async () => {
        try {
            const loadedAppointments = await getAppointments();
            setAppointments(loadedAppointments.map(appointment => ({
                title: `${appointment.departmentName} - ${appointment.doctorName}`,
                start: `${appointment.date}T${appointment.time}`,
            })));
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                await fetchAppointments();
            } catch (error) {
                console.error('Failed to fetch appointments:', error);
            }
        })();
    }, []);

    const handleSaveAppointment = async (appointmentData) => {
        console.log('Saving new appointment:', appointmentData);
        try {
            await addAppointment(appointmentData);
            await fetchAppointments();
        } catch (error) {
            console.error('Failed to save appointment:', error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <h2>Admin Dashboard</h2>
            <AppointmentForm onSaveAppointment={handleSaveAppointment} />
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={appointments}
            />
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    );
};

export default AdminDashboard;
