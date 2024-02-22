

//import LoginSignup from './Components/LoginSignup/loginSignup.jsx';
import Signup from "./pages/signup";
import Login from "./pages/login";
import Home from "./pages/home";
import PatientDashboard from './Components/Patients/PatientDashboard';
import PatientAccountSet from './Components/Patients/setAccountDetails';
import PatientEditAndViewAccount from './Components/Patients/editAndViewAccount';
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom"

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<Home/>} />
            <Route path={"login"} element={<Login/>} />
            <Route path={"signup"} element={<Signup/>} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/patient-setAccount" element={<PatientAccountSet />} />
            <Route path="/patient-editAndViewAccount" element={<PatientEditAndViewAccount />}/>

          </Route>
        </Routes>
      </BrowserRouter>

  );
}



export default App;
