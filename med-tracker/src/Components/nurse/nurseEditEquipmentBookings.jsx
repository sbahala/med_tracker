import React, { useState, useEffect } from 'react';
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc,getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const AppointmentDetailsModal = ({ isOpen, onClose, appointmentDetails }) => {
    if (!isOpen) return null;
  
    return (
      <div className="modal">
        <div className="modalContent">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>Patient Information</h2>
          <p>Name: {appointmentDetails?.patientName}</p>
          <p>DOB: {appointmentDetails?.dob}</p>
        </div>
      </div>
    );
  };
  
const NurseEditEquipmentBookings = () => {
  const [equipmentNames, setEquipmentNames] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [filter, setFilter] = useState({ name: '', status: 'booked' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState({});
  const navigate = useNavigate();


  useEffect(() => {
    const fetchEquipmentNames = async () => {
      const querySnapshot = await getDocs(collection(db, "equipment"));
      const names = querySnapshot.docs.map(doc => doc.data().name);
      setEquipmentNames([...new Set(names)]);
    };

    fetchEquipmentNames();
  }, []);

  useEffect(() => {
    const fetchEquipmentDetails = async (equipmentData, doc) => {
      const equipmentDetail = equipmentData.find(
        equipment => equipment.id === doc.data().equipmentId
      );
      return equipmentDetail
        ? {
            ...equipmentDetail,
            equipmentAppointmentId: doc.id,
            ...doc.data(),
          }
        : null;
    };
  
    const fetchBookedEquipmentData = async (equipmentData) => {
      const appointmentsSnapshot = await getDocs(collection(db, "equipmentAppointments"));
      return Promise.all(appointmentsSnapshot.docs.map(doc =>
        fetchEquipmentDetails(equipmentData, doc)
      ));
    };
  
    const filterEquipmentData = (equipmentData, filter) => {
      if (filter.name) {
        return equipmentData.filter(equipment => equipment.name === filter.name);
      }
      return equipmentData.filter(equipment => equipment.status === filter.status);
    };
  
    const fetchEquipment = async () => {
      const equipmentSnapshot = await getDocs(collection(db, "equipment"));
      let equipmentData = equipmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      equipmentData = filterEquipmentData(equipmentData, filter);
  
      if (filter.status === 'booked') {
        const bookedEquipmentData = await fetchBookedEquipmentData(equipmentData);
        setEquipment(bookedEquipmentData.filter(e => e != null));
      } else {
        setEquipment(equipmentData);
      }
    };
  
    fetchEquipment();
  }, [filter]);

  const handleStatusChange = async (equipmentId, newStatus, equipmentAppointmentId) => {
    let endTime = null;
    if (newStatus === 'available') {
        const now = new Date();
        endTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    }
    const equipmentRef = doc(db, "equipment", equipmentId);
    await updateDoc(equipmentRef, { status: newStatus });
  
    if (endTime) {
      const equipmentAppointmentRef = doc(db, "equipmentAppointments", equipmentAppointmentId);
      await updateDoc(equipmentAppointmentRef, { endTime });
    }
  
    setEquipment(prev => prev.map(e => e.id === equipmentId ? { ...e, status: newStatus, endTime: endTime } : e));
    let statusMessage = `Equipment Status changed to ${newStatus}.`;
    alert(statusMessage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const viewDetails = async (patientId) => {
    const patientRef = doc(db, "users", patientId);
    const patientSnap = await getDoc(patientRef);
    if (patientSnap.exists()) {
      const patientData = patientSnap.data();
      setSelectedAppointmentDetails({
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        dob: patientData.dob,
      });
      setIsModalOpen(true);
    } else {
      console.error("No patient found");
    }
  };
  const backNurseDashboard=()=>{
    navigate("/nurseDashboard");
    }
    const resetFilters = () => {
        setFilter({ name: '', status: 'booked' });
    };

  return (
    <div className="appointmentsContainer"> 
     <header className="fixed-header">
                <h1>Edit Equipment status</h1>
            </header>
     <main className="content">
     <div className="filters">
        <label htmlFor="nameFilter" className="filterLabel">Filter by Name:</label>
        <select id="nameFilter"name="name" className="nameFilterInput" value={filter.name} onChange={handleFilterChange}>
          <option value="">All</option>
          {equipmentNames.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))}
        </select>

        <label htmlFor="statusFilter" className="filterLabel">Filter by Status:</label>
        <select id="statusFilter" name="status"className="statusFilterInput"  value={filter.status} onChange={handleFilterChange}>
          <option value="booked">Booked</option>
        </select>
        <button onClick={resetFilters} className="resetButton">Reset Filters</button>
      </div>

      <table className="appointmentsTable">
        <thead>
          <tr>
            <th>Sl.no</th>
            <th>Equipment Name</th>
            <th>Status</th>
            {filter.status === 'booked' && <th>Patient Details</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.status}</td>
              {filter.status === 'booked' && <td>
                <button onClick={() => viewDetails(item.patientId)}>View Details</button>
              </td>}
              <td>
              <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value, item.equipmentAppointmentId)}>
                  <option value="available">Available</option>
                  <option value="inuse">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  {filter.status !== 'booked' && <option value="booked">Booked</option>}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
     </main>
     <AppointmentDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            appointmentDetails={selectedAppointmentDetails}
        />
        <footer className="footer">
                    <button className="dashboardButton" onClick={backNurseDashboard}>Nurse Dashboard</button>
        </footer>    
    </div>
  );
};

export default NurseEditEquipmentBookings;
