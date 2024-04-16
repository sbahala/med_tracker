import React, { useEffect, useState } from 'react';
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Typography } from '@mui/material';
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



    const backAdminDashboard=()=>{
        navigate("/adminDashboard");
    }

    return (
        <div className="appointmentsContainer">
            <header className="fixed-header">
                <h1>All Appointments</h1>
            </header>
            <main className="content">
                <table className="appointmentsTable">
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Department</th>
                        <th>Doctor</th>
                        <th>Status</th>
                        <th>Patient Name</th>
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
                            <td>{appointment.patientName}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {appointments.length === 0 && <Typography>No appointments found.</Typography>}
            </main>
            <footer className = "footer">
            <button className="dashboardButton" onClick={backAdminDashboard}>Admin Dashboard</button>
        </footer>
        </div>
    );
};

export default ViewAllAppointments;
