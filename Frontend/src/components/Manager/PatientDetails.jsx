import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Loading from '../common/Loading';


const PatientDetails = () => {
    // Add these validation functions
    const isValidPhoneNumber = (phone) => {
        const phoneRegex = /^\d{10}$/;  // Validates 10-digit number
        return phoneRegex.test(phone);
    };

    const isValidNumber = (value) => {
        return /^\d+$/.test(value);  // Changed from /^\d{10}$/ to /^\d+$/
    };

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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);
    const [shouldFetch, setShouldFetch] = useState(false);

    // Move these outside of the component render
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShouldFetch(true);
    };

    // Move the ref declaration to the top with other state declarations
    const searchInputRef = useRef(null);

    // Move the focus effect near other useEffects
    useEffect(() => {
        if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
            const cursorPosition = searchInputRef.current.selectionStart;
            searchInputRef.current.focus();
            searchInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [filteredPatients]);

    // Update SearchBar to be a proper component
    const SearchBar = () => (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div className="md:w-48">
                    <select
                        value={searchFilter}
                        onChange={(e) => {
                            setSearchFilter(e.target.value);
                            setShouldFetch(true);
                        }}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
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

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        let timeoutId;
        
        if (shouldFetch) {
            timeoutId = setTimeout(() => {
                fetchPatients();
                setShouldFetch(false);
            }, 500);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [searchTerm, searchFilter, currentPage, shouldFetch]);

    const fetchPatients = async () => {
        // Only show loading indicator for initial load or pagination
        if (!searchTerm) {
            setLoading(true);
        }

        try {
            const searchParams = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage
            });

            if (searchTerm) {
                searchParams.append('search', searchTerm);
                if (searchFilter !== 'all') {
                    searchParams.append('searchField', searchFilter);
                }
            }

            const response = await axios.get(
                `http://localhost:8080/api/v1/patient-details/get-all-patients?${searchParams.toString()}`
            );
            
            setPatients(response.data.message.patients || []);
            setFilteredPatients(response.data.message.patients || []);
            setTotalPages(response.data.message.pagination.totalPages);
            setError(null);
        } catch (err) {
            console.error('Fetch Error:', err);
            setError(err.message || 'Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (<Loading />);
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

    // Add Patient into the database 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation checks
        const validationErrors = [];

        // Phone number validations (keep 10 digits for phone numbers)
        if (!isValidPhoneNumber(formData.contactNumber)) {
            validationErrors.push("Contact number must be a 10-digit number");
        }
        if (!isValidPhoneNumber(formData.emergencyContact)) {
            validationErrors.push("Emergency contact must be a 10-digit number");
        }

        // Room, bed, and floor number validations (just check if numeric)
        if (formData.roomNumber && !isValidNumber(formData.roomNumber)) {
            validationErrors.push("Room number must be numeric");
        }
        if (formData.bedNumber && !isValidNumber(formData.bedNumber)) {
            validationErrors.push("Bed number must be numeric");
        }
        if (formData.floorNumber && !isValidNumber(formData.floorNumber)) {
            validationErrors.push("Floor number must be numeric");
        }

        // Age validation
        if (formData.age < 0 || formData.age > 150) {
            validationErrors.push("Please enter a valid age between 0 and 150");
        }

        // Name validation
        if (formData.name.length < 2) {
            validationErrors.push("Name must be at least 2 characters long");
        }

        // Date validations
        const admissionDate = new Date(formData.admissionDate);
        const dischargeDate = formData.dischargeDate ? new Date(formData.dischargeDate) : null;
        const today = new Date();

        if (admissionDate > today) {
            validationErrors.push("Admission date cannot be in the future");
        }

        if (dischargeDate && dischargeDate < admissionDate) {
            validationErrors.push("Discharge date cannot be before admission date");
        }

        // If there are validation errors, show them and stop submission
        if (validationErrors.length > 0) {
            setLoading(false);
            validationErrors.forEach(error => toast.error(error));
            return;
        }

        try {
            // Create the request payload with matching field names
            const patientData = {
                patientName: formData.name,
                diseases: formData.diseases ? formData.diseases.split(',').map(disease => disease.trim()) : [],
                allergies: formData.allergies ? formData.allergies.split(',').map(allergy => allergy.trim()) : [],
                roomNumber: formData.roomNumber,
                bedNumber: formData.bedNumber,
                floorNumber: formData.floorNumber,
                age: parseInt(formData.age),
                gender: formData.gender,
                contactInformation: formData.contactNumber,  
                emergencyContact: formData.emergencyContact,
                additionalDetails: formData.additionalDetails || '',
                admissionDate: new Date(formData.admissionDate).toISOString(),
                dischargeDate: formData.dischargeDate ? new Date(formData.dischargeDate).toISOString() : null
            };

            // Validate required fields
            const requiredFields = [
                'patientName',
                'roomNumber',
                'bedNumber',
                'floorNumber',
                'age',
                'gender',
                'contactInformation', 
                'emergencyContact',
                'admissionDate'
            ];

            const missingFields = requiredFields.filter(field => !patientData[field]);
            
            if (missingFields.length > 0) {
                toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                return;
            }

            const response = await axios.post('http://localhost:8080/api/v1/patient-details/create-patient', patientData);

            if (response.data.success) {
                toast.success('Patient added successfully');
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
                setShowForm(false);
                fetchPatients();
            }
        } catch (error) {
            console.error('Detailed error:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                const errorMessage = error.response.data.message || 'Please check all required fields are filled correctly';
                toast.error(`Failed to add patient: ${errorMessage}`);
            } else if (error.request) {
                toast.error('Network error: No response received from server');
            } else {
                toast.error('Failed to add patient: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const Pagination = () => (
        <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                            currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-300'
                        }`}
                    >
                        First
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                            currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-300'
                        }`}
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => setCurrentPage(idx + 1)}
                                className={`w-8 h-8 rounded-md text-sm font-medium ${
                                    currentPage === idx + 1
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-300'
                                }`}
                            >
                                {idx + 1}
                            </button>
                        )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                            currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-300'
                        }`}
                    >
                        Next
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                            currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-300'
                        }`}
                    >
                        Last
                    </button>
                </div>
            </div>
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
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
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
                                                if (value >= 0 && value <= 150) {
                                                    setFormData({...formData, age: value});
                                                }
                                            }}
                                            min="0"
                                            max="150"
                                            className={`w-full p-3 border-2 ${
                                                formData.age && (formData.age < 0 || formData.age > 150)
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                            } rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
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
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 10); // Only allow digits, max 10
                                                setFormData({...formData, contactNumber: value});
                                            }}
                                            onBlur={(e) => {
                                                if (!isValidPhoneNumber(e.target.value)) {
                                                    toast.warning("Please enter a valid 10-digit phone number");
                                                }
                                            }}
                                            className={`w-full p-3 border-2 ${
                                                formData.contactNumber && !isValidPhoneNumber(formData.contactNumber)
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                            } rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500`}
                                            placeholder="Enter 10-digit number"
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
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                                        <input
                                            type="text"
                                            value={formData.allergies}
                                            onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                                        <input
                                            type="tel"
                                            value={formData.emergencyContact}
                                            onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                                        <textarea
                                            value={formData.additionalDetails}
                                            onChange={(e) => setFormData({...formData, additionalDetails: e.target.value})}
                                            rows="2"
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
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
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                                setFormData({...formData, roomNumber: value});
                                            }}
                                            onBlur={(e) => {
                                                if (!isValidNumber(e.target.value)) {
                                                    toast.warning("Room number must be numeric");
                                                }
                                            }}
                                            className={`w-full p-3 border-2 ${
                                                formData.roomNumber && !isValidNumber(formData.roomNumber)
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                            } rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500`}
                                            placeholder="Enter room number"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bed Number</label>
                                        <input
                                            type="text"
                                            value={formData.bedNumber}
                                            onChange={(e) => setFormData({...formData, bedNumber: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Floor Number</label>
                                        <input
                                            type="text"
                                            value={formData.floorNumber}
                                            onChange={(e) => setFormData({...formData, floorNumber: e.target.value})}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
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
                                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Discharge Date</label>
                                            <input
                                                type="date"
                                                value={formData.dischargeDate}
                                                onChange={(e) => setFormData({...formData, dischargeDate: e.target.value})}
                                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500"
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
                                                    <div className="text-sm font-medium text-gray-900">{patient.patientName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">Room: {patient.roomNumber}</div>
                                                    <div className="text-sm text-gray-500">Bed: {patient.bedNumber}</div>
                                                    <div className="text-sm text-gray-500">Floor: {patient.floorNumber}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500">
                                                        Diseases: {Array.isArray(patient.diseases) ? patient.diseases.join(', ') : patient.diseases}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Allergies: {Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500">Age: {patient.age}</div>
                                                    <div className="text-sm text-gray-500">Gender: {patient.gender}</div>
                                                    <div className="text-sm text-gray-500">Contact: {patient.contactInformation}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        Admitted: {new Date(patient.admissionDate).toLocaleDateString()}
                                                    </div>
                                                    {patient.dischargeDate && (
                                                        <div className="text-sm text-gray-500">
                                                            Discharge: {new Date(patient.dischargeDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button 
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                        // onClick={() => handleEdit(patient._id)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="text-red-600 hover:text-red-900"
                                                        // onClick={() => handleDelete(patient._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <Pagination />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PatientDetails; 