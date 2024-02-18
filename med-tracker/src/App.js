

import LoginSignup from './Components/LoginSignup/loginSignup.jsx';
import Signup from "./pages/signup";
import Login from "./pages/login";
import Home from "./pages/home";
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

          </Route>
        </Routes>
      </BrowserRouter>

  );
}



export default App;
