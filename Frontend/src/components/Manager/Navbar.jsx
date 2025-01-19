import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const Navbar = ({ userName }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/';
    };

    const navItems = [
        { path: '/manager-dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/patient-details', icon: '🏥', label: 'Patient Details' },
        { path: '/staff-members', icon: '👥', label: 'Staff Members' },
        { path: '/diet-chart', icon: '📋', label: 'Diet Chart' },
        { path: '/meal-preparation', icon: '🍽️', label: 'Meal Preparation' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-20">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-md bg-white shadow-md"
                >
                    {isSidebarOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <nav className={`
                fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Hospital Management</h2>
                        <p className="text-sm text-gray-600 mt-1">Welcome, {userName || 'Manager'}</p>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-grow py-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50
                                    ${isActive(item.path) ? 'bg-blue-50 border-r-4 border-blue-500' : ''}
                                `}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <span className="mr-3">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <div className="p-4 border-t">
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center"
                        >
                            <span className="mr-2">🚪</span>
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
};

Navbar.propTypes = {
    userName: PropTypes.string
};

export default Navbar; 