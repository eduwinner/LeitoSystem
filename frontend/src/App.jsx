import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Patients from "./pages/Patients";
import Login from './pages/Login';
import Beds from './pages/Beds';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import TrocarSenha from './pages/TrocarSenha';
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
        <Route path="/users" element={<Users />} />
        <Route path="/trocar-senha" element={<TrocarSenha />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />

    </BrowserRouter>
  );
}

export default App;