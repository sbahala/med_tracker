import React, { useState ,useEffect, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import { db } from "../../firebase";
import { doc,updateDoc,getDoc } from "firebase/firestore";
import { AuthContext } from '../../context/authContext';
import '../../style.css';

const EditAccountDetails =()=>{
    const {currentUser} = useContext(AuthContext);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
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
        if(currentUser && currentUser.uid){
            const fetchUserData = async () => {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userSnapshot = await getDoc(userDocRef);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setPatientInfo(prev => ({
                        ...prev,
                        ...userData // This spreads the fetched data into the state, updating it
                    }));
                }  else {
                    console.log("No such document!");
                }
            };
    
            fetchUserData();
        } else{
            navigate('/login');
        }
    }, [currentUser,navigate]);

    const handleChange=(e)=>{
        const{name,value}=e.target;
        setPatientInfo(prevState=>({
            ...prevState,
            [name]:value
        }));
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: ""
        }));

    };
    const handleSubmit = async(e)=>{
        e.preventDefault();
        const trimmedPatientInfo = Object.keys(patientInfo).reduce((acc, key) => {
            acc[key] = typeof patientInfo[key] === 'string' ? patientInfo[key].trim() : patientInfo[key];
            return acc;
        }, {});
        let newErrors = {};
        const nameRegex = /^[A-Za-z]{1,25}$/;

        if (!nameRegex.test(trimmedPatientInfo.firstName.trim())) {
            newErrors.firstName = "First name must contain only letters and be a maximum of 25 characters long.";
        }

        if (!nameRegex.test(trimmedPatientInfo.lastName.trim())) {
            newErrors.lastName = "Last name must contain only letters and be a maximum of 25 characters long.";
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmedPatientInfo.email.trim())) {
            newErrors.email = "Please provide a valid email address.";
        }

        if (!trimmedPatientInfo.phoneNumber.trim() || !/^\+[1-9]\d{1,14}$/.test(trimmedPatientInfo.phoneNumber)) {
            newErrors.phoneNumber = "Please enter a valid phone number in international format (+1234567890).";
        }
        const selectedDate = new Date(trimmedPatientInfo.dob);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Normalize current date to midnight for accurate comparison
        if (selectedDate > currentDate) {
            newErrors.dob = "Date of birth cannot be in the future.";
        }
        if(!Object.values(trimmedPatientInfo).every(value => value.trim() !== "")){
            alert("Please provide all the details.");
            return;
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return; // Stop the form submission
        }
        const userDocRef = doc(db, "users", currentUser.uid);
        try{
            await updateDoc(userDocRef,{
                ...trimmedPatientInfo
            });
            navigate("/patientDashboard");

        }catch(error){
            console.error("Error updating patient details",error);
        }
    }
    const backPatientDashboard=()=>{
        navigate("/patientDashboard");
    }

    return (
        /*<div className="formContainer">disabled={!isEditable}*/
        <div className="setAccountDetailsContainer">
        <header className="fixed-header"><h1>Welcome to Edit Account - {patientInfo.firstName} {patientInfo.lastName}</h1></header>
        <main className="content">
        <form className="setAccountForm" onSubmit={handleSubmit}>
           <label className="formLabel">
            Patient Name
            <input className="inputField" type="text"name="firstName" placeholder="First Name" value={patientInfo.firstName} onChange={handleChange}/>
            {errors.firstName && <div className="error">{errors.firstName}</div>}
            <input className="inputField" type="text"name="lastName" placeholder="Last Name" value={patientInfo.lastName} onChange={handleChange} />
            {errors.lastName && <div className="error">{errors.lastName}</div>}
           </label>
           <label>Email<input className='email'type='email'name='email'placeholder='email'value={patientInfo.email} disabled ></input>
           {errors.email && <div className="error">{errors.email}</div>}
           </label>
          <label className="formLabel"> Date of Birth
          <input className="inputField" type="date"name="dob" placeholder="Date of birth" value={patientInfo.dob} onChange={handleChange} />
          {errors.dob && <div className="error">{errors.dob}</div>}
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
           <input className="inputField" type="text"name="phoneNumber" placeholder="+1234567890" value={patientInfo.phoneNumber} onChange={handleChange}/>
           {errors.phoneNumber && <div className="error">{errors.phoneNumber}</div>}
           </label>
          <label className="formLabel"> Address
          <input className="inputField" type="text"name="address" placeholder="Address" value={patientInfo.address} onChange={handleChange}/>
          {errors.address && <div className="error">{errors.address}</div>}
          </label>
          <button className="submitButton" type="submit">Edit Details</button>
           </form>
        </main>
        <footer className = "footer">
            <button className="dashboardButton" onClick={backPatientDashboard}>Patient Dashboard</button>
        </footer>
           
        </div>
        /*<button className="editButton" onClick={toggleEdit}>Edit Details</button> */
        
    );

}
export default EditAccountDetails;