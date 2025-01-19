import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PropTypes from 'prop-types';
// Manager Components
import ManagerLogin from './components/Login/ManagerLogin'
import ManagerDashboard from './components/Manager/ManagerDashboard'
import MealPreparation from './components/Manager/MealPreparation'
import PatientDetails from './components/Manager/PatientDetails'
import DietChart from './components/Manager/DietChart'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PantryStaff from './components/Manager/PantryStaff'
import MealPreparationList from './components/Pantry/MealPreparationList'

import PantryStaffLogin from './components/Login/PantryStaffLogin'
import PantryDashboard from './components/Pantry/PantryDashboard'
import DeliveryAssignment from './components/Pantry/DeliveryAssignment'

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    // Check the current path to determine which login page to redirect to
    const path = window.location.pathname;
    if (path.includes('pantry')) {
      return <Navigate to="/pantry-login" />;
    }
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

      <Routes>
        <Route path="/pantry-login" element={<PantryStaffLogin />}/>
        <Route
          path="/pantry-dashboard"
          element={
            <ProtectedRoute>
              <PantryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-preparations"
          element={
            <ProtectedRoute>
              <MealPreparationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery-status"
          element={
            <ProtectedRoute>
              <DeliveryAssignment />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}



export default App
