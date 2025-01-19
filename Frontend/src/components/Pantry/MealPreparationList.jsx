import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PantryNavbar from './PantryNavbar';

function MealPreparationList() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [loading, setLoading] = useState(true);
    const [deliveries, setDeliveries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            navigate('/pantry-login');
            return;
        }
    }, [navigate]);

    useEffect(() => {
        const fetchDeliveries = async () => {
            setLoading(true);
            try {
                const mockData = {
                    upcoming: [
                        // ... mock data
                    ],
                    completed: [
                        // ... mock data
                    ],
                    pending: [
                        // ... mock data
                    ]
                };

                setDeliveries(mockData[activeTab]);
                setTotalPages(Math.ceil(mockData[activeTab].length / itemsPerPage));
            } catch (error) {
                console.error('Error fetching deliveries:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveries();
    }, [activeTab, currentPage, itemsPerPage]);

    const renderPagination = () => (
        <div className="flex justify-center space-x-2 mt-4">
            <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md bg-blue-50 text-blue-600 disabled:opacity-50"
            >
                Previous
            </button>
            <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-md bg-blue-50 text-blue-600 disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );

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
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Meal Deliveries</h1>
                        <p className="text-gray-600">Manage all meal preparations and deliveries</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="mb-6 border-b">
                        <nav className="flex space-x-4">
                            {['upcoming', 'completed', 'pending'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setCurrentPage(1);
                                    }}
                                    className={`py-2 px-4 text-sm font-medium capitalize ${
                                        activeTab === tab
                                            ? 'border-b-2 border-blue-600 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab} Deliveries
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Deliveries Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Patient</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Room</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Meal Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Diet Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Assigned To</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {deliveries
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((delivery) => (
                                            <tr key={delivery.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">{delivery.patientName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{delivery.roomNumber}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{delivery.mealType}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{delivery.dietType}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{delivery.deliveryTime}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{delivery.assignedTo}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        delivery.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        delivery.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                        {delivery.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <button className="text-blue-600 hover:text-blue-800">
                                                        Update Status
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination()}
                    </div>
                </div>
            </div>
        </>
    );
}

export default MealPreparationList; 