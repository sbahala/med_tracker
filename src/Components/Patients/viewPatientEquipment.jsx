import React, { useEffect, useState, useContext } from 'react';
import { db } from "../../firebase";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import '../../style.css';
import { AuthContext } from '../../context/authContext';
import {useNavigate} from "react-router-dom";

const ViewPatientEquipment = () => {
    const [equipmentAppointments, setEquipmentAppointments] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEquipmentAppointments = async () => {
            if (currentUser && currentUser.uid) {

                const equipmentAppointmentsQuery = query(collection(db, "equipmentAppointments"), where("patientId", "==", currentUser.uid));
                const querySnapshot = await getDocs(equipmentAppointmentsQuery);

                const appointmentsData = await Promise.all(querySnapshot.docs.map(async (appointmentDoc) => {
                    const appointmentData = appointmentDoc.data();
                    const equipmentDocRef = doc(db, "equipment", appointmentData.equipmentId);
                    const equipmentSnapshot = await getDoc(equipmentDocRef);
                    const equipmentData = equipmentSnapshot.exists() ? equipmentSnapshot.data() : { name: "Unknown", status: "Unknown" };

                    return {
                        date: appointmentData.date,
                        startTime: appointmentData.startTime,
                        endTime: appointmentData.endTime,
                        equipmentName: equipmentData.name,
                        equipmentStatus: equipmentData.status
                    };
                }));
                setEquipmentAppointments(appointmentsData);
            }
        };

        fetchEquipmentAppointments();
    }, [currentUser]);

    const backPatientDashboard=()=>{
        navigate("/patientDashboard");
    }

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
            <footer className="footer">
                <button className="dashboardButton" onClick={backPatientDashboard}>Patient Dashboard</button>
            </footer>
        </div>
    );
};

export default ViewPatientEquipment;
