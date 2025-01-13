import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PropTypes from 'prop-types';
import ManagerLogin from './components/ManagerLogin'
import ManagerDashboard from './components/ManagerDashboard'
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      </Routes>
    </Router>
  );
}

export default App
