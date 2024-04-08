import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from "../../firebase";
import { collection, getDocs, addDoc ,doc, getDoc, updateDoc,deleteDoc,query,where} from "firebase/firestore";

const DoctorBookEquipment = () => {
  const { appointmentId } = useParams(); // Get appointmentId from the URL
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const navigate = useNavigate();
  const [bookedEquipments, setBookedEquipments] = useState([]);

  useEffect(() => {
    const fetchAvailableEquipment = async () => {
      const querySnapshot = await getDocs(collection(db, "equipment"));
      const availableEquipment = querySnapshot.docs
        .filter(doc => doc.data().status === 'available')
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setEquipmentList(availableEquipment);
    };

    fetchAvailableEquipment();
  }, []);

  
  useEffect(() => {
    const fetchBookedEquipment = async () => {
      const equipmentAppointmentsQuery = query( collection(db, "equipmentAppointments"), where("appointmentId", "==", appointmentId));
      const querySnapshot = await getDocs(equipmentAppointmentsQuery);
      const bookedList = [];
      for (const bookedEquip of querySnapshot.docs) {
        const equipmentData = (await getDoc(doc(db, "equipment", bookedEquip.data().equipmentId))).data();
        bookedList.push({
          id: bookedEquip.id,
          equipmentId: bookedEquip.data().equipmentId,
          equipmentName: equipmentData.name,
          status: equipmentData.status,
        });
      }
      setBookedEquipments(bookedList);
    };
  
    fetchBookedEquipment();
  }, [appointmentId]);

  const handleEquipmentBooking = async () => {
    try {
      // Fetch the appointment to get the patientId
      const appointmentRef = doc(db, "appointments", appointmentId);
      const appointmentSnap = await getDoc(appointmentRef);
      if (!appointmentSnap.exists()) {
        console.error("Appointment not found");
        alert("Appointment not found.");
        return;
      }
      const patientId = appointmentSnap.data().patientId;
  
      const equipmentRef = doc(db, "equipment", selectedEquipment);
      await updateDoc(equipmentRef, { status: 'booked' });
  
      const equipmentAppointment = await addDoc(collection(db, "equipmentAppointments"), {
        equipmentId: selectedEquipment,
        appointmentId,
        patientId,
      });
      await updateDoc(equipmentAppointment, {
        equipmentAppointmentId: equipmentAppointment.id,
      });
  
      const equipmentName = equipmentList.find(e => e.id === selectedEquipment)?.name || 'Unknown';

      setBookedEquipments(prevBookedEquipments => [...prevBookedEquipments,
        {
            id: equipmentAppointment.id, // This is the ID of the new appointment.
            equipmentId: selectedEquipment,
            equipmentName,
            status: 'booked',
        },
        ]);
      alert("Equipment booked successfully.");
    } catch (error) {
      alert("Failed to book equipment.");
    }
  };
  const backDoctorOntimeAppointments= () => {
    navigate("/doctorOntimeAppointments");
  };
  const handleRemoveBooking = async (equipmentAppointmentId, equipmentId) => {
    try {
      const equipmentRef = doc(db, "equipment", equipmentId);
      await updateDoc(equipmentRef, { status: 'available' });
      const equipmentAppointmentRef = doc(db, "equipmentAppointments", equipmentAppointmentId);
      await deleteDoc(equipmentAppointmentRef);
      setBookedEquipments(prevBookedEquipments => prevBookedEquipments.filter(e => e.id !== equipmentAppointmentId));
  
      alert("Equipment booking removed successfully.");
    } catch (error) {
      alert("Failed to remove equipment booking.");
    }
  };
  

  return (
    <div className="appointmentsContainer">
         <header className="fixed-header">
                <h1>Book Equipment for Appointment</h1>
            </header>
            <main className="content">
                <div className="filters">
                    <label for="equipmentSelector" class="equipment-label">Select Equipment:</label>
                    <select id="equipmentSelector" class="equipment-selector" value={selectedEquipment} onChange={(e) => setSelectedEquipment(e.target.value)}>
                        <option value="">--Please choose an equipment--</option>
                        {equipmentList.map(equipment => (
                            <option key={equipment.id} value={equipment.id}>{equipment.name}</option>
                        ))}
                    </select>
                    <button class="book-equipment-btn" onClick={handleEquipmentBooking}>Book Equipment</button>
                    </div>
                <div >
                {bookedEquipments.length > 0 ? (
                    <table className="appointmentsTable">
                        <thead>
                        <tr>
                            <th>Sl.no</th>
                            <th>Equipment</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookedEquipments.map((equipment, index) => (
                            <tr key={equipment.id}>
                            <td>{index + 1}</td>
                            <td>{equipment.equipmentName}</td>
                            <td>{equipment.status}</td>
                            <td>
                                <button onClick={() => handleRemoveBooking(equipment.id, equipment.equipmentId)}>Remove</button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    ) : (
                        <p>No bookings yet.</p>
                      )}
                </div>
            </main>
            <footer className="footer">
                <button className="dashboardButton" onClick={backDoctorOntimeAppointments}>Doctor OnTime Appointments</button>
            </footer>
    
    </div>
    
  );
};

export default DoctorBookEquipment;
