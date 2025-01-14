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
import MealPreparationList from './components/MealPreparationList'

import PantryStaffLogin from './components/PantryStaffLogin'
import PantryDashboard from './components/PantryDashboard'
import DeliveryAssignment from './components/DeliveryAssignment'

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
