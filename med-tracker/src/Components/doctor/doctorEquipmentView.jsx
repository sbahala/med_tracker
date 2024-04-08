import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import '../../style.css';
const DoctorEquipmentView = () => {
  const [equipment, setEquipment] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data from Firebase or use mock data
    const fetchEquipment = async () => {
      const querySnapshot = await getDocs(collection(db, "equipment"));
      const equipmentList = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setEquipment(equipmentList);

    };
    
    fetchEquipment();
  }, []);

  const columns = React.useMemo(
    () => [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Room Number', accessor: 'roomNumber' },
      { Header: 'Status', accessor: 'status' },
      // If you want to format the lastChecked date, you can use a Cell renderer
    ],
    []
  );
  const backDoctorDashboard = () => {
    navigate("/doctorDashboard");
};

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: equipment });

  return (
    <div className="appointmentsContainer">
        <main>
        <div className="equipment-container">
      <h1 className="equipment-header">View Equipment Status</h1>
      <table {...getTableProps()} className="equipment-table">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
        </main>
        <footer className="footer">
                <button className="dashboardButton" onClick={backDoctorDashboard}>Doctor Dashboard</button>
            </footer>
    </div>
  );
};

export default DoctorEquipmentView;
