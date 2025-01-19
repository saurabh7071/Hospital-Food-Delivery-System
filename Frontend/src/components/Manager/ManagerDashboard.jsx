import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import Loading from '../common/Loading';

// Hospital theme colors
const colors = {
    primary: '#005EB8',    // NHS Blue
    secondary: '#41B6E6',  // Information Blue
    success: '#009639',    // Success Green
    warning: '#FFA000',    // Warning Amber
    error: '#DA291C',      // Alert Red
    background: '#F0F4F5', // Light Blue Grey
    white: '#FFFFFF'
};

const ManagerDashboard = () => {
    const [mealPreparations] = useState([]);
    const [mealDeliveries] = useState([]);
    const [totalstaff, setTotalStaff] = useState(0);
    const [totalPatients, setTotalPatients] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchPatientCount = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/patient-details/get-all-patients');
        
            // Access the totalCount from pagination data
            if (response.data?.message?.pagination?.totalCount) {
                setTotalPatients(response.data.message.pagination.totalCount);
            } else {
                // Fallback to counting patients array if pagination data isn't available
                const patients = response.data?.message?.patients || [];
                setTotalPatients(patients.length);
            }
        } catch (error) {
            console.error('Error fetching patient count:', error);
            setTotalPatients(0);
        }
    };

    const fetchPantryStaffCount = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/pantry-staff/get-all-pantry-staff');

            if(response.data && response.data.message && response.data.message.staff){
                const staff = response.data.message.staff;
                setTotalStaff(staff.length);
            }else{
                setTotalStaff(0);
            }
        } catch (error) {
            console.error('Error fetching staff count:', error);
            setTotalStaff(0);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchPatientCount();
                await fetchPantryStaffCount();
                setError(null);
            } catch (error) {
                console.error("Error:", error);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (<Loading />);
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
                <div className="text-error p-4 rounded-md bg-white shadow-lg">{error}</div>
            </div>
        );
    }

    return (
        <>
            <Navbar userName="Hospital Manager" />
            <div className="lg:ml-64 p-4">
                <div className="p-6">
                    {/* Header - Updated to match other pages */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Manager Dashboard</h1>
                            <p className="text-sm text-gray-600">Hospital Meal Management Overview</p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Patients"
                            count={totalPatients}
                            color={colors.primary}
                            icon="🏥"
                        />
                        <StatCard
                            title="Meal Preparations"
                            count={mealPreparations.length}
                            color={colors.secondary}
                            icon="🍽️"
                        />
                        <StatCard
                            title="Meal Deliveries"
                            count={mealDeliveries.length}
                            color={colors.success}
                            icon="🚚"
                        />
                        <StatCard
                            title="Staff Members"
                            count={totalstaff}
                            color={colors.warning}
                            icon="👥"
                        />
                    </div>

                    {/* Data Tables */}
                    {/* <div className="space-y-6">
                        <DataTable
                            title="Meal Preparations"
                            data={mealPreparations}
                            columns={[
                                { key: '_id', label: 'ID' },
                                { key: 'dietPlanId', label: 'Diet Plan' },
                                { key: 'preparationStatus', label: 'Status' }
                            ]}
                        />
                        <DataTable
                            title="Meal Deliveries"
                            data={mealDeliveries}
                            columns={[
                                { key: '_id', label: 'ID' },
                                { key: 'deliveryStatus', label: 'Status' },
                                { key: 'deliveryPersonId', label: 'Delivery Person' }
                            ]}
                        />
                        <DataTable
                            title="Staff Members"
                            data={totalstaff}
                            columns={[
                                { key: '_id', label: 'ID' },
                                { key: 'name', label: 'Name' },
                                { key: 'role', label: 'Role' }
                            ]}
                        />
                    </div> */}
                </div>
            </div>
        </>
    );
};

// Reusable Components
const StatCard = ({ title, count, color, icon }) => (
    <div
        className="rounded-lg shadow-md p-6 transition-transform hover:scale-105"
        style={{ backgroundColor: colors.white }}
    >
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

// const DataTable = ({ title, data, columns }) => (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <h2 className="text-xl font-semibold p-4 border-b" style={{ color: colors.primary }}>
//             {title}
//         </h2>
//         <div className="overflow-x-auto">
//             <table className="w-full">
//                 <thead>
//                     <tr className="bg-gray-50">
//                         {columns.map(column => (
//                             <th key={column.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
//                                 {column.label}
//                             </th>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.map((item, index) => (
//                         <tr
//                             key={item._id}
//                             className={`border-t hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`}
//                         >
//                             {columns.map(column => (
//                                 <td key={column.key} className="px-4 py-3 text-sm text-gray-800">
//                                     {item[column.key]}
//                                 </td>
//                             ))}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     </div>
// );

// DataTable.propTypes = {
//     title: PropTypes.string.isRequired,
//     data: PropTypes.arrayOf(PropTypes.object).isRequired,
//     columns: PropTypes.arrayOf(
//         PropTypes.shape({
//             key: PropTypes.string.isRequired,
//             label: PropTypes.string.isRequired
//         })
//     ).isRequired
// };

export default ManagerDashboard;
