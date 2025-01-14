import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
// import instance from '../utils/axiosConfig';

const STAFF_ROLES = ["Pantry Staff", "Kitchen Staff", "Delivery Staff"];

const PantryStaff = () => {
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFilter, setSearchFilter] = useState('name');
    const [filteredStaff, setFilteredStaff] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        location: '',
        role: 'Pantry Staff'
    });

    useEffect(() => {
        fetchStaffMembers();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredStaff(staffMembers);
            return;
        }

        const filtered = staffMembers.filter(staff => {
            const searchLower = searchTerm.toLowerCase();
            switch (searchFilter) {
                case 'name':
                    return staff.name.toLowerCase().includes(searchLower);
                case 'location':
                    return staff.location.toLowerCase().includes(searchLower);
                case 'role':
                    return staff.role.toLowerCase().includes(searchLower);
                case 'all':
                    return (
                        staff.name.toLowerCase().includes(searchLower) ||
                        staff.location.toLowerCase().includes(searchLower) ||
                        staff.role.toLowerCase().includes(searchLower) ||
                        staff.contactNumber.includes(searchTerm)
                    );
                default:
                    return true;
            }
        });
        setFilteredStaff(filtered);
    }, [searchTerm, searchFilter, staffMembers]);

    const fetchStaffMembers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/pantry-staff/create-pantry-staff');
            setStaffMembers(response.data.data || []);
            setFilteredStaff(response.data.data || []);
        } catch (err) {
            toast.error('Failed to fetch staff members: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/pantry-staff/create-pantry-staff', formData);
            if (response.status === 201) {
                toast.success('Staff member added successfully');
                setShowForm(false);
                fetchStaffMembers(); // Fetch updated staff list
                setFormData({
                    name: '',
                    contactNumber: '',
                    location: '',
                    role: 'Pantry Staff'
                });
            } else {
                toast.error('Something went wrong. Please try again.');
            }
        } catch (err) {
            toast.error('Failed to add staff member: ' + err.message);
        }
    };

    const SearchBar = () => (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search staff members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div className="md:w-48">
                    <select
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">All Fields</option>
                        <option value="name">Name</option>
                        <option value="location">Location</option>
                        <option value="role">Role</option>
                    </select>
                </div>
            </div>
            {searchTerm && (
                <div className="mt-2 text-sm text-gray-600">
                    Found {filteredStaff.length} matching staff members
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <>
                <Navbar userName="Hospital Manager" />
                <div className="lg:ml-64 p-4">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-xl text-gray-600">Loading staff data...</div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar userName="Hospital Manager" />
            <div className="lg:ml-64 p-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Staff Management</h1>
                            <p className="text-sm text-gray-600">Manage pantry and kitchen staff</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            {showForm ? 'Cancel' : 'Add New Staff'}
                        </button>
                    </div>

                    {showForm && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Add New Staff Member</h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        pattern="[0-9]{10}"
                                        title="Please enter a valid 10-digit phone number"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        required
                                    >
                                        {STAFF_ROLES.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                    >
                                        Add Staff Member
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Staff List */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <SearchBar />
                        {filteredStaff.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                {searchTerm ? 'No matching staff members found.' : 'No staff members found. Add new staff to get started.'}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredStaff.map((staff) => (
                                            <tr key={staff._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">{staff.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{staff.contactNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{staff.location}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{staff.role}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                                    <button className="text-red-600 hover:text-red-900">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PantryStaff; 