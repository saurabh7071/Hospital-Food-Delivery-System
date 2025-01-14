import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Navbar from './Navbar';

const colors = {
    primary: '#005EB8',
    secondary: '#41B6E6',
    success: '#009639',
    warning: '#FFA000',
    error: '#DA291C',
    background: '#F0F4F5',
    white: '#FFFFFF'
};

const PantryDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        pendingPreparations: 0,
        inProgressPreparations: 0,
        completedPreparations: 0,
        pendingDeliveries: 0,
        activeDeliveryStaff: 0
    });
    const [recentPreparations, setRecentPreparations] = useState([]);
    const [activeDeliveries, setActiveDeliveries] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsResponse, preparationsResponse, deliveriesResponse] = await Promise.all([
                    axios.get('/api/v1/pantry-dashboard/stats'),
                    axios.get('/api/v1/meal-preparation/recent'),
                    axios.get('/api/v1/meal-delivery/active')
                ]);

                setStats(statsResponse.data.data);
                setRecentPreparations(preparationsResponse.data.data);
                setActiveDeliveries(deliveriesResponse.data.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-primary animate-pulse">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-error p-4 rounded-md bg-white shadow-lg">{error}</div>
            </div>
        );
    }

    return (
        <>
            <Navbar userName="Pantry Admin" />
            <div className="lg:ml-64 p-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Pantry Dashboard</h1>
                            <p className="text-sm text-gray-600">Monitor meal preparations and deliveries</p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <StatCard
                            title="Pending Preparations"
                            count={stats.pendingPreparations}
                            color={colors.warning}
                            icon="🔄"
                        />
                        <StatCard
                            title="In Progress"
                            count={stats.inProgressPreparations}
                            color={colors.primary}
                            icon="👨‍🍳"
                        />
                        <StatCard
                            title="Completed Today"
                            count={stats.completedPreparations}
                            color={colors.success}
                            icon="✅"
                        />
                        <StatCard
                            title="Pending Deliveries"
                            count={stats.pendingDeliveries}
                            color={colors.error}
                            icon="📦"
                        />
                        <StatCard
                            title="Active Delivery Staff"
                            count={stats.activeDeliveryStaff}
                            color={colors.secondary}
                            icon="🚶"
                        />
                    </div>

                    {/* Recent Preparations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DataTable
                            title="Recent Meal Preparations"
                            data={recentPreparations}
                            columns={[
                                { key: 'patientName', label: 'Patient' },
                                { key: 'mealTime', label: 'Meal Time' },
                                { key: 'status', label: 'Status' },
                                { key: 'assignedTo', label: 'Assigned To' }
                            ]}
                        />

                        {/* Active Deliveries */}
                        <DataTable
                            title="Active Deliveries"
                            data={activeDeliveries}
                            columns={[
                                { key: 'patientName', label: 'Patient' },
                                { key: 'roomNumber', label: 'Room' },
                                { key: 'deliveryPerson', label: 'Delivery Person' },
                                { key: 'status', label: 'Status' }
                            ]}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

// Reusable Components (StatCard and DataTable) - Same as ManagerDashboard
const StatCard = ({ title, count, color, icon }) => (
    <div className="rounded-lg shadow-md p-6 transition-transform hover:scale-105 bg-white">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-3xl font-bold mt-2" style={{ color }}>{count}</p>
            </div>
            <span className="text-2xl">{icon}</span>
        </div>
    </div>
);

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
};

const DataTable = ({ title, data, columns }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b" style={{ color: colors.primary }}>
            {title}
        </h2>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50">
                        {columns.map(column => (
                            <th key={column.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className={`border-t hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                            {columns.map(column => (
                                <td key={column.key} className="px-4 py-3 text-sm text-gray-800">
                                    {item[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

DataTable.propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    ).isRequired
};

export default PantryDashboard; 