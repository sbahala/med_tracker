import React,{useContext} from 'react';
import { AuthContext } from '../../context/authContext';
import {useNavigate} from 'react-router-dom';
import { auth } from '../../firebase';
import {signOut} from "firebase/auth";
import {isPatientProfileComplete} from "../service/appointmentService";

const PatientDashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const handleSetupAccount=()=>{
        navigate('/editPatientAccount');
    }
    const handleViewAppointments=()=>{
        navigate('/appointmentRecords');
    }

    const handleCreateAppointments = async () => {
        try {
          // Replace 'currentUserId' with the actual logged-in user's ID
          const { isComplete, missingFields } = await isPatientProfileComplete(currentUser.uid);
      
          if (isComplete) {
            navigate('/appointmentCreate');
          } else {
            alert(`Please Edit you account. Missing fields: ${missingFields.join(', ')}`);
          }
        } catch (error) {
          console.error("Error checking profile completeness: ", error);
          alert("There was an issue checking your profile completeness.");
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
                <div className="appointmentSelectionContainer">
                <button onClick={handleSetupAccount} className="selectionButton">Edit Account</button>
                <button onClick={handleViewAppointments} className="selectionButton">View Appointments Records</button>
                <button onClick={handleCreateAppointments} className="selectionButton">Create Appointments</button>
                </div>
            </main>
            <footer className="footer">
                <button className="Logout" onClick={handleSignOut}>
                Log Out
                </button>
            </footer>           
        </div>
    )
    
};

export default PatientDashboard;