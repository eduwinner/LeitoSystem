import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Patients from "./pages/Patients";
import Login from './pages/Login';
import Beds from './pages/Beds';
import Dashboard from './pages/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/beds" element={<Beds />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
      
    </BrowserRouter>
  );
}

export default App;