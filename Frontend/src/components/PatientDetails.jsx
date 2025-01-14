import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';


const PatientDetails = () => {
    const [patients, setPatients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        diseases: '',
        allergies: '',
        roomNumber: '',
        bedNumber: '',
        floorNumber: '',
        age: '',
        gender: 'Male',
        contactNumber: '',
        emergencyContact: '',
        additionalDetails: '',
        admissionDate: '',
        dischargeDate: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFilter, setSearchFilter] = useState('name');
    const [filteredPatients, setFilteredPatients] = useState([]);

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredPatients(patients);
            return;
        }

        const filtered = patients.filter(patient => {
            const searchLower = searchTerm.toLowerCase();
            switch (searchFilter) {
                case 'name':
                    return patient.name.toLowerCase().includes(searchLower);
                case 'room':
                    return patient.roomNumber.toString().includes(searchTerm);
                case 'bed':
                    return patient.bedNumber.toString().includes(searchTerm);
                case 'disease':
                    return patient.diseases.toLowerCase().includes(searchLower);
                case 'all':
                    return (
                        patient.name.toLowerCase().includes(searchLower) ||
                        patient.roomNumber.toString().includes(searchTerm) ||
                        patient.bedNumber.toString().includes(searchTerm) ||
                        patient.diseases.toLowerCase().includes(searchLower) ||
                        patient.contactNumber.includes(searchTerm)
                    );
                default:
                    return true;
            }
        });
        setFilteredPatients(filtered);
    }, [searchTerm, searchFilter, patients]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/v1/patient-details/get-all-patients');
            console.log('API Response:', response.data);
            setPatients(response.data.data || []);
            setError(null);
        } catch (err) {
            console.error('Fetch Error:', err);
            setError(err.message || 'Failed to fetch patients');
            toast.error('Failed to fetch patients: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar userName="Hospital Manager" />
                <div className="lg:ml-64 p-4">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-xl text-gray-600">Loading patients...</div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar userName="Hospital Manager" />
                <div className="lg:ml-64 p-4">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-xl text-red-600">Error: {error}</div>
                    </div>
                </div>
            </>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate age
        if (parseInt(formData.age) < 0) {
            toast.error('Age cannot be negative');
            return;
        }
        
        setLoading(true);
        try {
            await axios.post('/api/v1/patient-details/create-patient', formData);
            toast.success('Patient added successfully');
            setShowForm(false);
            setFormData({
                name: '',
                diseases: '',
                allergies: '',
                roomNumber: '',
                bedNumber: '',
                floorNumber: '',
                age: '',
                gender: 'Male',
                contactNumber: '',
                emergencyContact: '',
                additionalDetails: '',
                admissionDate: '',
                dischargeDate: ''
            });
            fetchPatients();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add patient');
        } finally {
            setLoading(false);
        }
    };

    const SearchBar = () => (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search patients..."
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
                        <option value="room">Room Number</option>
                        <option value="bed">Bed Number</option>
                        <option value="disease">Disease</option>
                    </select>
                </div>
            </div>
            {searchTerm && (
                <div className="mt-2 text-sm text-gray-600">
                    Found {filteredPatients.length} matching patients
                </div>
            )}
        </div>
    );

    return (
        <>
            <Navbar userName="Hospital Manager" />
            <div className="lg:ml-64 p-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Patient Details</h1>
                            <p className="text-sm text-gray-600">Manage patient information and records</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            {showForm ? 'Cancel' : 'Add New Patient'}
                        </button>
                    </div>

                    {/* Add Patient Form */}
                    {showForm && (
                        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                            <h2 className="text-2xl font-semibold mb-6">Add New Patient</h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Personal Information */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (value >= 0) {  // Only update if age is non-negative
                                                    setFormData({...formData, age: value});
                                                }
                                            }}
                                            min="0"  // Prevent negative values in number input
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                                        <input
                                            type="tel"
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Medical Information */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Diseases</label>
                                        <input
                                            type="text"
                                            value={formData.diseases}
                                            onChange={(e) => setFormData({...formData, diseases: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                                        <input
                                            type="text"
                                            value={formData.allergies}
                                            onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                                        <input
                                            type="tel"
                                            value={formData.emergencyContact}
                                            onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                                        <textarea
                                            value={formData.additionalDetails}
                                            onChange={(e) => setFormData({...formData, additionalDetails: e.target.value})}
                                            rows="2"
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Room Information */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                                        <input
                                            type="text"
                                            value={formData.roomNumber}
                                            onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bed Number</label>
                                        <input
                                            type="text"
                                            value={formData.bedNumber}
                                            onChange={(e) => setFormData({...formData, bedNumber: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Floor Number</label>
                                        <input
                                            type="text"
                                            value={formData.floorNumber}
                                            onChange={(e) => setFormData({...formData, floorNumber: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date</label>
                                            <input
                                                type="date"
                                                value={formData.admissionDate}
                                                onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
                                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Discharge Date</label>
                                            <input
                                                type="date"
                                                value={formData.dischargeDate}
                                                onChange={(e) => setFormData({...formData, dischargeDate: e.target.value})}
                                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="lg:col-span-3 mt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 text-lg font-medium transition-colors duration-200"
                                    >
                                        {loading ? 'Adding...' : 'Add Patient'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Patients Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <SearchBar />
                        {filteredPatients.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                {searchTerm ? 'No matching patients found.' : 'No patients found. Add a new patient to get started.'}
                            </div>
                        ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Info</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical Info</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Info</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">Room: {patient.roomNumber}</div>
                                                <div className="text-sm text-gray-500">Bed: {patient.bedNumber}</div>
                                                <div className="text-sm text-gray-500">Floor: {patient.floorNumber}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">Diseases: {patient.diseases}</div>
                                                <div className="text-sm text-gray-500">Allergies: {patient.allergies}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">Age: {patient.age}</div>
                                                <div className="text-sm text-gray-500">Gender: {patient.gender}</div>
                                                <div className="text-sm text-gray-500">Contact: {patient.contactNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">Admitted: {new Date(patient.admissionDate).toLocaleDateString()}</div>
                                                {patient.dischargeDate && (
                                                    <div className="text-sm text-gray-500">
                                                        Discharge: {new Date(patient.dischargeDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </td>
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

export default PatientDetails; 