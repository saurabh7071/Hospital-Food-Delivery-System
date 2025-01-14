import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function PantryNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('staffId');
        localStorage.removeItem('staffName');
        navigate('/pantry-login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'bg-blue-700' : '';
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-0 left-0 p-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Sidebar - Desktop & Mobile */}
            <div className={`fixed left-0 top-0 w-64 h-full bg-blue-800 text-white transform transition-transform duration-200 ease-in-out z-40
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo/Header */}
                    <div className="mb-8 p-4 mt-16 lg:mt-4">
                        <h1 className="text-2xl font-bold">Pantry Dashboard</h1>
                        <p className="text-sm opacity-70">Hospital Food Management</p>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-grow">
                        <ul className="space-y-2 px-4">
                            <li>
                                <Link
                                    to="/pantry-dashboard"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${isActive('/pantry-dashboard')}`}
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/meal-preparations"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${isActive('/pantry/meal-preparation')}`}
                                >
                                    Meal Preparation
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/delivery-status"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${isActive('/pantry/delivery-status')}`}
                                >
                                    Delivery Status
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Logout Section */}
                    <div className="p-4 mt-auto">
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
}

export default PantryNavbar; 