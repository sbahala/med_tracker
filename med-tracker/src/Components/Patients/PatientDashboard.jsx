import React,{ useEffect }  from 'react';
import {useNavigate} from 'react-router-dom';
import { auth } from '../../firebase';
import {signOut} from "firebase/auth";

const PatientDashboard = () => {
    const navigate = useNavigate();

    // useEffect(()=>{
    //     const currentUser = auth.currentUser;
    //     const storedUserId = localStorage.getItem('userId');
    //     if(!currentUser || currentUser.uid !== storedUserId){
    //         localStorage.removeItem('accountSetupComplete');
    //         localStorage.removeItem('userId'); // Ensure clean session
    //         navigate('/login');
    //     }
    // }, [navigate]);

    const isAccountSetupComplete = localStorage.getItem('accountSetupComplete') === 'true';
    const handleSetupAccount=()=>{
        navigate('/patient-setAccount');
    }
    const handleViewAccount=()=>{
        //console.log("View Details");
       navigate('/patient-editAndViewAccount');
    }
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
            <h1>Welcome to Patient Dashboard</h1>
            <div>
                <button onClick={handleSetupAccount} disabled={isAccountSetupComplete}>Setup Account</button>
                <button onClick={handleViewAccount}>View And Edit Account Details</button>
            </div>
            <button className="Logout" onClick={handleSignOut}>
                Log Out
            </button>
        </div>
    )
    
};

export default PatientDashboard;