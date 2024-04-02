import React, {useCallback, useEffect, useState} from 'react';
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import EquipmentCreate from "../service/equipmentCreate";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import '../../style.css';

const ViewAllEquipments = () => {
    const [equipments, setEquipments] = useState([]);

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

    return (
        <div className="equipmentContainer">
            <header className="fixed-header">
                <h1>Equipments</h1>
            </header>

            <main className="content">
                {equipments.length > 0 ? (
                    equipments.map((equipment) => (
                        <Accordion key={equipment.id}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>{equipment.name} - Room: {equipment.roomNumber}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>Status: {equipment.status}</Typography>
                                <Typography>ID: {equipment.id}</Typography>
                                {/* You can add more equipment details here */}
                            </AccordionDetails>
                        </Accordion>
                    ))
                ) : (
                    <Typography>No equipment found.</Typography>
                )}
            </main>

            <EquipmentCreate onEquipmentCreated={fetchEquipments} />
        </div>
    );
};

export default ViewAllEquipments;