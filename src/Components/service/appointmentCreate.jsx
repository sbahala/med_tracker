import React, {useEffect, useState} from "react";
import {addAppointment, getAppointments} from "./appointmentService";
import AppointmentForm from "./appointmentForm";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import {useNavigate} from "react-router-dom";


const AppointmentCreate = () => {
    const navigate = useNavigate();

    const handleBack = () =>{
        navigate(-1);
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

    return(
        <div>
            <AppointmentForm onSaveAppointment={handleSaveAppointment} />
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={appointments}
            />


            <footer className = "footer">
                <button className="Back" onClick={handleBack}>
                    Back
                </button>
            </footer>
        </div>

    )

}

export default AppointmentCreate;