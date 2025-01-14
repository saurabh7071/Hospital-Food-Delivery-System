import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PantryNavbar from './PantryNavbar';

function DeliveryAssignment() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [deliveries, setDeliveries] = useState([]);
    const [deliveryStaff, setDeliveryStaff] = useState([]);

    // Mock data for testing
    useEffect(() => {
        const mockData = {
            deliveries: [
                {
                    id: 1,
                    patientName: "John Doe",
                    roomNumber: "301",
                    mealType: "Lunch",
                    dietType: "Diabetic",
                    deliveryTime: "12:30 PM",
                    status: "Pending",
                    assignedTo: null
                },
                {
                    id: 2,
                    patientName: "Jane Smith",
                    roomNumber: "205",
                    mealType: "Lunch",
                    dietType: "Regular",
                    deliveryTime: "12:45 PM",
                    status: "On Way",
                    assignedTo: "David Wilson"
                },
                {
                    id: 3,
                    patientName: "Mike Johnson",
                    roomNumber: "402",
                    mealType: "Lunch",
                    dietType: "Soft",
                    deliveryTime: "12:15 PM",
                    status: "Delivered",
                    assignedTo: "Sarah Brown"
                }
            ],
            staff: [
                { id: 1, name: "David Wilson" },
                { id: 2, name: "Sarah Brown" },
                { id: 3, name: "James Miller" }
            ]
        };

        setDeliveries(mockData.deliveries);
        setDeliveryStaff(mockData.staff);
        setLoading(false);
    }, []);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            navigate('/pantry-login');
            return;
        }
    }, [navigate]);

    const handleAssignStaff = async (deliveryId, staffId) => {
        try {
            // Mock API call
            // await axios.post(`/api/deliveries/${deliveryId}/assign`, { staffId });
            
            setDeliveries(prevDeliveries => 
                prevDeliveries.map(delivery => {
                    if (delivery.id === deliveryId) {
                        const assignedStaff = deliveryStaff.find(staff => staff.id === staffId);
                        return {
                            ...delivery,
                            assignedTo: assignedStaff.name,
                            status: 'Pending'
                        };
                    }
                    return delivery;
                })
            );
        } catch (error) {
            console.error('Error assigning staff:', error);
        }
    };

    const handleUpdateStatus = async (deliveryId, newStatus) => {
        try {
            // Mock API call
            // await axios.put(`/api/deliveries/${deliveryId}/status`, { status: newStatus });
            
            setDeliveries(prevDeliveries => 
                prevDeliveries.map(delivery => {
                    if (delivery.id === deliveryId) {
                        return {
                            ...delivery,
                            status: newStatus
                        };
                    }
                    return delivery;
                })
            );
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'On Way': return 'bg-blue-100 text-blue-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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
                        <h1 className="text-2xl font-bold text-gray-800">Delivery Assignments</h1>
                        <p className="text-gray-600">Assign and track meal deliveries</p>
                    </div>

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
                                    {deliveries.map((delivery) => (
                                        <tr key={delivery.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.patientName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.roomNumber}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.mealType}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.dietType}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{delivery.deliveryTime}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {delivery.assignedTo || (
                                                    <select
                                                        className="border rounded px-2 py-1 text-sm"
                                                        onChange={(e) => handleAssignStaff(delivery.id, Number(e.target.value))}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Assign Staff</option>
                                                        {deliveryStaff.map(staff => (
                                                            <option key={staff.id} value={staff.id}>
                                                                {staff.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(delivery.status)}`}>
                                                    {delivery.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {delivery.assignedTo && (
                                                    <select
                                                        className="border rounded px-2 py-1 text-sm"
                                                        onChange={(e) => handleUpdateStatus(delivery.id, e.target.value)}
                                                        value={delivery.status}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="On Way">On Way</option>
                                                        <option value="Delivered">Delivered</option>
                                                    </select>
                                                )}
                                            </td>
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

export default DeliveryAssignment; 