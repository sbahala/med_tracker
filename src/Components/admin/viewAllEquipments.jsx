import React, {useCallback, useEffect, useState} from 'react';
import { db } from "../../firebase";
import {collection, doc, getDocs, updateDoc} from "firebase/firestore";
import EquipmentCreate from "../service/equipmentCreate";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import '../../style.css';
import {useNavigate} from "react-router-dom";


const ViewAllEquipments = () => {
    const [equipments, setEquipments] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentEquipment, setCurrentEquipment] = useState(null);
    const navigate = useNavigate();

    const fetchEquipments = useCallback(async () => {
        const querySnapshot = await getDocs(collection(db, "equipment"));
        const equipmentsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setEquipments(equipmentsData);
    }, []);

    useEffect(() => {
        fetchEquipments();
    }, [fetchEquipments]);

    const backAdminDashboard=()=>{
        navigate("/adminDashboard");
    }

    const handleOpenDialog = (equipment) => {
        setCurrentEquipment(equipment);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSaveEquipment = async () => {
        if (currentEquipment) {
            const equipmentRef = doc(db, "equipment", currentEquipment.id);
            await updateDoc(equipmentRef, {
                name: currentEquipment.name,
                roomNumber: currentEquipment.roomNumber,
                status: currentEquipment.status,
            });
            await fetchEquipments();
            handleCloseDialog();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentEquipment(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="appointmentsContainer">
            <header className="fixed-header">
                <h1>Equipments</h1>
            </header>
            <main className="content">
                <EquipmentCreate onEquipmentCreated={fetchEquipments} />
                <table className="appointmentsTable">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Room Number</th>
                        <th>Status</th>
                        <th>ID</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {equipments.length > 0 ? equipments.map((equipment) => (
                        <tr key={equipment.id}>
                            <td>{equipment.name}</td>
                            <td>{equipment.roomNumber}</td>
                            <td>{equipment.status}</td>
                            <td>{equipment.id}</td>
                            <td>
                                <button onClick={() => handleOpenDialog(equipment)}>Edit</button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5">No equipment found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </main>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Edit Equipment</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Equipment Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        name="name"
                        value={currentEquipment?.name || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Room Number"
                        type="text"
                        fullWidth
                        variant="outlined"
                        name="roomNumber"
                        value={currentEquipment?.roomNumber || ''}
                        onChange={handleChange}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={currentEquipment?.status || ''}
                            onChange={handleChange}
                            label="Status"
                            name="status"
                        >
                            <MenuItem value="booked">Booked</MenuItem>
                            <MenuItem value="available">Available</MenuItem>
                            <MenuItem value="maintenance">Maintenance</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveEquipment}>Save</Button>
                </DialogActions>
            </Dialog>

            <footer className = "footer">
                <button className="dashboardButton" onClick={backAdminDashboard}>Admin Dashboard</button>
            </footer>
        </div>
    );
};

export default ViewAllEquipments;