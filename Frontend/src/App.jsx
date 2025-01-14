import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PropTypes from 'prop-types';
import ManagerLogin from './components/ManagerLogin'
import ManagerDashboard from './components/ManagerDashboard'
import PatientDetails from './components/PatientDetails'
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DietChart from './components/DietChart'
import PantryStaff from './components/PantryStaff'
import MealPreparation from './components/MealPreparation'

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
      return <Navigate to="/" />;
  }
  
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<ManagerLogin />} />
        <Route 
          path="/manager-dashboard" 
          element={
            <ProtectedRoute>
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patient-details" 
          element={
            <ProtectedRoute>
              <PatientDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/diet-chart" 
          element={
            <ProtectedRoute>
              <DietChart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/diet-chart/:patientId" 
          element={
            <ProtectedRoute>
              <DietChart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff-members" 
          element={
            <ProtectedRoute>
              <PantryStaff />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/meal-preparation" 
          element={
            <ProtectedRoute>
              <MealPreparation />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App
