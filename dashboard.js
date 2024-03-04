// App.js

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import PatientDashboard from './PatientDashboard';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/patient" component={PatientDashboard} />
      </Switch>
    </Router>
  );
}

export default App;
// AdminDashboard.js

import React from 'react';
import { Route, Switch, NavLink } from 'react-router-dom';
import ManageAppointments from './ManageAppointments';
import ManageEquipments from './ManageEquipments';
import ManageStaffAccounts from './ManageStaffAccounts';
import ManagePatientRecords from './ManagePatientRecords';

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li><NavLink to="/admin/appointments">Manage Appointments</NavLink></li>
          <li><NavLink to="/admin/equipments">Manage Equipments</NavLink></li>
          <li><NavLink to="/admin/staff">Manage Staff Accounts</NavLink></li>
          <li><NavLink to="/admin/patients">Manage Patient Records</NavLink></li>
        </ul>
      </nav>

      <Switch>
        <Route path="/admin/appointments" component={ManageAppointments} />
        <Route path="/admin/equipments" component={ManageEquipments} />
        <Route path="/admin/staff" component={ManageStaffAccounts} />
        <Route path="/admin/patients" component={ManagePatientRecords} />
      </Switch>
    </div>
  );
}

export default AdminDashboard;
// ManageAppointments.js

import React from 'react';

function ManageAppointments() {
  return (
    <div>
      <h2>Manage Appointments</h2>
      {/* Add your code for managing appointments here */}
    </div>
  );
}

export default ManageAppointments;
// PatientDashboard.js

import React from 'react';
import { Route, Switch, NavLink } from 'react-router-dom';
import ManageAccountDetails from './ManageAccountDetails';
import ManageAppointmentsPatient from './ManageAppointmentsPatient';

function PatientDashboard() {
  return (
    <div>
      <h1>Patient Dashboard</h1>
      <nav>
        <ul>
          <li><NavLink to="/patient/account">Manage Account Details</NavLink></li>
          <li><NavLink to="/patient/appointments">Manage Appointments</NavLink></li>
        </ul>
      </nav>

      <Switch>
        <Route path="/patient/account" component={ManageAccountDetails} />
        <Route path="/patient/appointments" component={ManageAppointmentsPatient} />
      </Switch>
    </div>
  );
}

export default PatientDashboard;
