import React, { useEffect, useState } from 'react';
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import '../../style.css';
import {useNavigate} from "react-router-dom";

const ViewEquipmentsApp = () => {
    const [equipmentAppointments, setEquipmentAppointments] = useState([]);
    const navigate = useNavigate();
    const backAdminDashboard=()=>{
        navigate("/adminDashboard");
    }

    useEffect(() => {
        const fetchEquipmentAppointments = async () => {
            const appointmentsSnapshot = await getDocs(collection(db, "equipmentAppointments"));
            const appointmentsData = await Promise.all(appointmentsSnapshot.docs.map(async (appointmentDoc) => {
                const appointment = appointmentDoc.data();
                const equipmentDoc = await getDoc(doc(db, "equipment", appointment.equipmentId));
                const equipment = equipmentDoc.exists() ? equipmentDoc.data() : { name: "Unknown", status: "Unknown" };

                return {
                    date: appointment.date,
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                    equipmentName: equipment.name,
                    equipmentStatus: equipment.status
                };
            }));
            setEquipmentAppointments(appointmentsData);
        };

        fetchEquipmentAppointments();
    }, []);

    return (
        <div className="equipmentContainer">
            <h1>Equipment Appointments</h1>
            <table className="appointmentsTable">
                <thead>
                <tr>
                    <th>Equipment Name</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                </tr>
                </thead>
                <tbody>
                {equipmentAppointments.map((appointment, index) => (
                    <tr key={index}>
                        <td>{appointment.equipmentName}</td>
                        <td>{appointment.equipmentStatus}</td>
                        <td>{appointment.date}</td>
                        <td>{appointment.startTime}</td>
                        <td>{appointment.endTime}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <footer className = "footer">
                <button className="dashboardButton" onClick={backAdminDashboard}>Admin Dashboard</button>
            </footer>
        </div>

    );
};

export default ViewEquipmentsApp;
