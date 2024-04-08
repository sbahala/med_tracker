import React, { useState, useEffect } from 'react';
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const NurseEditEquipmentBookings = () => {
  const [equipmentNames, setEquipmentNames] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [filter, setFilter] = useState({ name: '', status: 'available' }); // Default status is 'available'

  useEffect(() => {
    const fetchEquipmentNames = async () => {
      const querySnapshot = await getDocs(collection(db, "equipment"));
      const names = querySnapshot.docs.map(doc => doc.data().name);
      setEquipmentNames([...new Set(names)]); // Use a Set to ensure unique names
    };

    fetchEquipmentNames();
  }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      const equipmentSnapshot = await getDocs(collection(db, "equipment"));
      const equipmentData = equipmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (filter.status === 'booked') {
        const appointmentsSnapshot = await getDocs(collection(db, "equipmentAppointments"));
        const bookedEquipmentData = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const combinedData = bookedEquipmentData.map(booking => {
          return {
            ...booking,
            ...equipmentData.find(equipment => equipment.id === booking.equipmentId)
          };
        });
        setEquipment(combinedData);
      } else {
        const filteredEquipment = equipmentData.filter(equipment => equipment.status === filter.status);
        setEquipment(filteredEquipment);
      }
    };

    fetchEquipment();
  }, [filter]); // Refetch when filters change

  const handleStatusChange = async (equipmentId, newStatus) => {
    const equipmentRef = doc(db, "equipment", equipmentId);
    await updateDoc(equipmentRef, { status: newStatus });

    // Optimistically update UI
    setEquipment(prev => prev.map(e => e.id === equipmentId ? { ...e, status: newStatus } : e));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  return (
    <div className="appointmentsContainer"> 
     <header className="fixed-header">
                <h1>Edit Equipment status</h1>
            </header>
     <main className="content">
     <div className="filters">
        <label>Filter by Name:</label>
        <select name="name" value={filter.name} onChange={handleFilterChange}>
          <option value="">All</option>
          {equipmentNames.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))}
        </select>

        <label>Filter by Status:</label>
        <select name="status" value={filter.status} onChange={handleFilterChange}>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
          <option value="inuse">In Use</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <table className="appointmentsTable">
        <thead>
          <tr>
            <th>Sl.no</th>
            <th>Equipment Name</th>
            <th>Status</th>
            {filter.status === 'booked' && <th>Appointment Details</th>}
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
                {/* Button to view appointment details */}
                <button>View Details</button>
              </td>}
              <td>
                <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)}>
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
    </div>
  );
};

export default NurseEditEquipmentBookings;
