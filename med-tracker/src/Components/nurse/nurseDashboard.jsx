import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from "firebase/auth";

const NurseDashboard = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    const handlePendingAppointments=()=>{
        navigate('/nurseAppointmentsView');
    }
    const handleAcceptedAppointments=()=>{
        navigate('/nurseAcceptedAppointmentsView');
    }
    const handleEquipmentAppointments=()=>{
        navigate('/nurseEditEquipmentBookings');
    }

    return (
      <div>
         <header className="fixed-header"><h1>Welcome to Nurse Dashboard</h1></header>
        <main className="content">
 
                    <div className="appointmentSelectionContainer">
                        <button onClick={handlePendingAppointments} className="selectionButton">Pending Appointments</button>
                        <button onClick={handleAcceptedAppointments} className="selectionButton">Accepted Appointments</button>
                        <button onClick={handleEquipmentAppointments} className="selectionButton">Edit Equipment Appointments</button>
                    </div>

        </main>
        <footer className = "footer">
                <button className="Logout" onClick={handleSignOut}>Log Out</button>
            </footer>
      </div>
    );
  };  

export default NurseDashboard;



