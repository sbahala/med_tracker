import React, { useState } from 'react';
import { db } from "../../firebase";
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, query, where,  updateDoc } from "firebase/firestore";
import '../../style.css';

const EditExistingAccounts =() => {
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("firstName", "==", searchFirstName), where("lastName", "==", searchLastName));
    const querySnapshot = await getDocs(q);
    const fetchedUsers = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

    if (fetchedUsers.length > 0) {
      // Assume the first result is the correct one and set it as the selectedUser
      setSelectedUser(fetchedUsers[0]);
    } else {
      alert('No user found with the provided name.');
      setSelectedUser(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser(prevUser => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUser) {
      const userRef = doc(db, "users", selectedUser.uid);
      await updateDoc(userRef, selectedUser);
      alert('User updated successfully!');
      setSelectedUser(null); // Clear form after successful update
    } else {
      alert('Please search for a user to update.');
    }
  };

  const backAdminDashboard=()=>{
    navigate("/adminDashboard");
}

  return (
    <div className="setAccountDetailsContainer">
       <header className="fixed-header"><h1>Edit Users Account </h1></header>
       <main className="content">
        <div>
        <input
          type="text"
          value={searchFirstName}
          onChange={(e) => setSearchFirstName(e.target.value)}
          placeholder="First Name"
        />
        <input
          type="text"
          value={searchLastName}
          onChange={(e) => setSearchLastName(e.target.value)}
          placeholder="Last Name"
        />
        <button onClick={handleSearch}>Search</button>
        </div>
      {selectedUser && (
        <form  className="setAccountForm" onSubmit={handleSubmit}>
            <label className="formLabel">
            Patient Name
            <input className="inputField" type="text"name="firstName" placeholder="First Name" value={selectedUser.firstName} onChange={handleInputChange}/>
            <input className="inputField" type="text"name="lastName" placeholder="Last Name" value={selectedUser.lastName} onChange={handleInputChange} />
           </label>
           <label>Email<input className='email'type='email'name='email'placeholder='email'value={selectedUser.email} disabled ></input>
           
           </label>
          <label className="formLabel"> Date of Birth
          <input className="inputField" type="date"name="dob" placeholder="Date of birth" value={selectedUser.dob} onChange={handleInputChange} />
          
          </label>
           <label className="formLabel"> Gender
           <select name="gender"  value={selectedUser.gender} onChange={handleInputChange}>
            <option value ="male">Male</option>
            <option value ="female">Female</option>
            <option value ="other">Other</option>
           </select>
           </label>
           <label className="formLabel"> Phone Number
           <input className="inputField" type="text"name="phoneNumber" placeholder="+1234567890" value={selectedUser.phoneNumber} onChange={handleInputChange}/>
           
           </label>
          <label className="formLabel"> Address
          <input className="inputField" type="text"name="address" placeholder="Address" value={selectedUser.address} onChange={handleInputChange}/>
          </label>
          <label className="formLabel"> Role
           <select name="role"  value={selectedUser.role} onChange={handleInputChange}>
            <option value ="doctor">doctor</option>
            <option value ="nurse">nurse</option>
            <option value ="patient">patient</option>
            <option value ="admin">admin</option>
           </select>
           </label>
          <button type="submit">Update Account</button>
        </form>
      )}
      </main>
      <footer className = "footer">
            <button className="dashboardButton" onClick={backAdminDashboard}>Admin Dashboard</button>
        </footer>
    </div>
  );
};
export default EditExistingAccounts;