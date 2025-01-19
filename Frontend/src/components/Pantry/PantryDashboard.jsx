import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PantryNavbar from './PantryNavbar';

function PantryDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        mealPreparation: {
            pending: 0,
            inProgress: 0,
            completed: 0
        },
        deliveryStatus: {
            pending: 0,
            inTransit: 0,
            delivered: 0
        },
        activeDeliveryStaff: 0,
        upcomingDeliveries: []
    });

    // Add this useEffect for authentication
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            navigate('/pantry-login');
            return;
        }
    }, [navigate]);

    // Mock data for testing
    useEffect(() => {
        const mockData = {
            data: {
                mealPreparation: {
                    pending: 12,
                    inProgress: 5,
                    completed: 25
                },
                deliveryStatus: {
                    pending: 8,
                    inTransit: 4,
                    delivered: 30
                },
                activeDeliveryStaff: 6,
                upcomingDeliveries: [
                    {
                        id: 1,
                        patientName: "John Doe",
                        roomNumber: "301",
                        mealType: "Lunch",
                        dietType: "Diabetic",
                        deliveryTime: "12:30 PM",
                        assignedTo: "David Wilson",
                        status: "Preparing"
                    },
                    {
                        id: 2,
                        patientName: "Jane Smith",
                        roomNumber: "205",
                        mealType: "Lunch",
                        dietType: "Regular",
                        deliveryTime: "12:45 PM",
                        assignedTo: "Sarah Johnson",
                        status: "Ready"
                    }
                ]
            }
        };

        setStats(mockData.data);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-blue-600 animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <PantryNavbar />
            <div className="lg:ml-64 pt-16 lg:pt-4">
                <div className="p-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Pantry Dashboard</h1>
                            <p className="text-sm text-gray-600">Monitor meal preparations and deliveries</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {/* Meal Preparation Stats */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Meal Preparation</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Pending</span>
                                    <span className="text-yellow-600 font-semibold">{stats.mealPreparation.pending}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">In Progress</span>
                                    <span className="text-blue-600 font-semibold">{stats.mealPreparation.inProgress}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Completed</span>
                                    <span className="text-green-600 font-semibold">{stats.mealPreparation.completed}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Status */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Status</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Pending</span>
                                    <span className="text-yellow-600 font-semibold">{stats.deliveryStatus.pending}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">In Transit</span>
                                    <span className="text-blue-600 font-semibold">{stats.deliveryStatus.inTransit}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Delivered</span>
                                    <span className="text-green-600 font-semibold">{stats.deliveryStatus.delivered}</span>
                                </div>
                            </div>
                        </div>

                        {/* Active Staff */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Delivery Staff</h3>
                            <div className="flex items-center justify-center">
                                <div className="text-4xl font-bold text-blue-600">{stats.activeDeliveryStaff}</div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Deliveries Table - Limited to 5 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-800">Recent Upcoming Deliveries</h2>
                            <Link 
                                to="/meal-preparations" 
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Patient</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Room</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Meal Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Diet Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Assigned To</th>                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {stats.upcomingDeliveries.slice(0, 5).map((delivery) => (
                                        <tr key={delivery.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.patientName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.roomNumber}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.mealType}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.dietType}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.deliveryTime}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.assignedTo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PantryDashboard;