import React, { useState ,useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {  auth, db } from "../../firebase";
import { doc,updateDoc,getDoc } from "firebase/firestore";
import '../../style.css';

const SetAccountDetails =()=>{
    const navigate = useNavigate();
    const [isEditable] = useState(false);/*setIsEditable*/
    const [patientInfo,setPatientInfo]=useState({
        firstName:'',
        lastName:'',
        dob:'',
        gender:'',
        phoneNumber:'',
        email:'',
        address:''

    });

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem('userId');
            const userDocRef = doc(db, "users", userId);
            const userSnapshot = await getDoc(userDocRef);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                console.log(userData);
                setPatientInfo(prev => ({
                    ...prev,
                    ...userData // This spreads the fetched data into the state, updating it
                }));
            }  else {
                console.log("No such document!");
            }
        };

        fetchUserData();
    }, []);

    const handleChange=(e)=>{
        const{name,value}=e.target;
        setPatientInfo(prevState=>({
            ...prevState,
            [name]:value
        }));

    };
    const handleSubmit = async(e)=>{
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        const userDocRef = doc(db, "users", userId);
        try{
            const cc = await updateDoc(userDocRef,{
                ...patientInfo,
                email:auth.currentUser.email,
            });
            console.log(cc);
            localStorage.setItem('accountSetupComplete', 'true');
            navigate("/patient-dashboard");

        }catch(error){
            console.error("Error updating patient details",error);
        }
    }
    /*const toggleEdit = () => {
        setIsEditable(!isEditable);
    };*/
    const backPatientDashboard=()=>{
        navigate("/patient-dashboard");
    }

    return (
        /*<div className="formContainer">disabled={!isEditable}*/
        <div className="setAccountDetailsContainer">
           <p>Welcome to the Patient Dashboard</p>
           <form className="setAccountForm" onSubmit={handleSubmit}>
           <label className="formLabel">
            Patient Name
            <input className="inputField" type="text"name="firstName" placeholder="First Name" value={patientInfo.firstName} onChange={handleChange} readOnly={!isEditable} />
            <input className="inputField" type="text"name="lastName" placeholder="Last Name" value={patientInfo.lastName} onChange={handleChange} readOnly={!isEditable}/>
           </label>
          <label className="formLabel"> Date of Birth
          <input className="inputField" type="date"name="dob" placeholder="Date of birth" value={patientInfo.dob} onChange={handleChange} />
          </label>
           <label className="formLabel"> Gender
           <select name="gender"  value={patientInfo.gender} onChange={handleChange}>
            <option value ="">Select Gender</option>
            <option value ="male">Male</option>
            <option value ="female">Female</option>
            <option value ="other">Other</option>
           </select>
           </label>
           <label className="formLabel"> Phone Number
           <input className="inputField" type="text"name="phoneNumber" placeholder="Phone Number" value={patientInfo.phoneNumber} onChange={handleChange}/>
           </label>
          <label className="formLabel"> Address
          <input className="inputField" type="text"name="address" placeholder="Address" value={patientInfo.address} onChange={handleChange}/>
          </label>
          <button className="submitButton" type="submit">Submit Details</button>
           </form><br/><br/>
           <button className="dashboardButton" onClick={backPatientDashboard}>Patient Dashboard</button>
        </div>
        /*<button className="editButton" onClick={toggleEdit}>Edit Details</button> */
        
    );

}
export default SetAccountDetails;