import React, {useState ,useEffect} from "react";
import {useNavigate} from "react-router-dom";
import { db } from "../../firebase";
import { doc,updateDoc,getDoc } from "firebase/firestore";
import '../../style.css';

const EditAndViewAccount  = ()=>{
    const navigate = useNavigate();
    const [isEditable,setIsEditable] = useState(false);
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
    const toggleEditMode = async () => {
        if (isEditable) {
            // Save changes when toggling from edit to view mode
            try {
                const userId = localStorage.getItem('userId');
                await updateDoc(doc(db, "users", userId), patientInfo);
                console.log("Document successfully updated!");
            } catch (error) {
                console.error("Error updating patient details", error);
            }
        }
        setIsEditable(!isEditable);
    };

    return(
        <div className="setAccountDetailsContainer">
           <p>Welcome to the Patient Dashboard</p>
           <form className="setAccountForm" onSubmit={(e) => e.preventDefault()}>
           <label className="formLabel">
            Patient Name
            <input className="inputField" type="text"name="firstName" placeholder="First Name" value={patientInfo.firstName} onChange={handleChange} disabled={!isEditable} />
            <input className="inputField" type="text"name="lastName" placeholder="Last Name" value={patientInfo.lastName} onChange={handleChange} disabled={!isEditable}/>
           </label>
          <label className="formLabel"> Date of Birth
          <input className="inputField" type="date"name="dob" placeholder="Date of birth" value={patientInfo.dob} onChange={handleChange}  disabled={!isEditable}/>
          </label>
           <label className="formLabel"> Gender
           <select name="gender"  value={patientInfo.gender} onChange={handleChange}  disabled={!isEditable}>
            <option value ="">Select Gender</option>
            <option value ="male">Male</option>
            <option value ="female">Female</option>
            <option value ="other">Other</option>
           </select>
           </label>
           <label className="formLabel"> Phone Number
           <input className="inputField" type="text"name="phoneNumber" placeholder="Phone Number" value={patientInfo.phoneNumber} onChange={handleChange}  disabled={!isEditable}/>
           </label>
          <label className="formLabel"> Address
          <input className="inputField" type="text"name="address" placeholder="Address" value={patientInfo.address} onChange={handleChange}  disabled={!isEditable}/>
          </label>
           </form><br/><br/>
           <button className="editButton" onClick={toggleEditMode}>
                {isEditable ? 'Save Changes' : 'Edit Details'}
            </button>
            <button className="dashboardButton" onClick={() => navigate("/patient-dashboard")}>
                Back to Dashboard
            </button>
        </div>

    )

};
export default EditAndViewAccount;
