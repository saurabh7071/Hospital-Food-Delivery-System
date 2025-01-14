import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import PropTypes from 'prop-types';

const MEAL_TIMES = ['Morning', 'Evening', 'Night'];

const DietChart = () => {
    const [dietPlans, setDietPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [patients, setPatients] = useState([]);
    const { patientId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFilter, setSearchFilter] = useState('name');
    const [filteredDietPlans, setFilteredDietPlans] = useState([]);

    const [formData, setFormData] = useState({
        patientId: '',
        meals: [
            {
                mealTime: 'Morning',
                mealItems: [{ name: '', ingredients: [], calories: 0 }],
                specificInstructions: ''
            }
        ]
    });

    useEffect(() => {
        if (patientId) {
            // If viewing a specific patient's diet plan
            const fetchPatientDietPlan = async () => {
                try {
                    const response = await axios.get(`/api/v1/diet-plan/patient/${patientId}`);
                    setDietPlans([response.data.data]);
                    setError(null);
                } catch (err) {
                    setError('Failed to fetch patient diet plan: ' + err.message);
                    toast.error('Error loading diet plan: ' + err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchPatientDietPlan();
        } else {
            fetchDietPlans();
        }
        fetchPatients();
    }, [patientId]);

    const fetchDietPlans = async () => {
        try {
            console.log('Fetching diet plans...');
            const response = await axios.get('/api/v1/diet-plan/get-all-diet-plans');
            console.log('Diet plans response:', response.data);
            setDietPlans(response.data.data || []); // Add fallback empty array
            setError(null);
        } catch (err) {
            console.error('Diet plans fetch error:', err);
            setError('Failed to fetch diet plans: ' + err.message);
            toast.error('Error loading diet plans: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            console.log('Fetching patients...');
            const response = await axios.get('/api/v1/patient-details/get-all-patients');
            console.log('Patients response:', response.data);
            setPatients(response.data.data || []); // Add fallback empty array
        } catch (err) {
            console.error('Patients fetch error:', err);
            toast.error('Failed to fetch patients: ' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/v1/diet-plan/create-diet-plan', formData);
            toast.success('Diet plan added successfully');
            setShowForm(false);
            fetchDietPlans();
        } catch (err) {
            toast.error('Failed to add diet plan: ' + err.message);
        }
    };

    const handleEdit = (plan) => {
        setFormData(plan);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddMeal = () => {
        setFormData({
            ...formData,
            meals: [...formData.meals, {
                mealTime: MEAL_TIMES[0],
                mealItems: [{ name: '', ingredients: [], calories: 0 }],
                specificInstructions: ''
            }]
        });
    };

    const DietPlanCard = ({ plan }) => {
        const patient = patients.find(p => p._id === plan.patientId);
        
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                            {patient?.name || 'Unknown Patient'}
                        </h3>
                        <p className="text-sm text-gray-600">
                            Room: {patient?.roomNumber}, Bed: {patient?.bedNumber}
                        </p>
                    </div>
                    <button
                        onClick={() => handleEdit(plan)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Edit Plan
                    </button>
                </div>

                {plan.meals.map((meal, index) => (
                    <div key={index} className="mb-4 border-t pt-4">
                        <h4 className="text-lg font-medium text-gray-700 mb-2">
                            {meal.mealTime}
                        </h4>
                        <div className="pl-4">
                            {meal.mealItems.map((item, idx) => (
                                <div key={idx} className="mb-2">
                                    <p className="text-gray-800 font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-600">
                                        Ingredients: {item.ingredients.join(', ')}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Calories: {item.calories}
                                    </p>
                                </div>
                            ))}
                            {meal.specificInstructions && (
                                <p className="text-sm text-red-600 mt-2">
                                    Special Instructions: {meal.specificInstructions}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    DietPlanCard.propTypes = {
        plan: PropTypes.shape({
            patientId: PropTypes.string.isRequired,
            meals: PropTypes.arrayOf(PropTypes.shape({
                mealTime: PropTypes.string.isRequired,
                mealItems: PropTypes.arrayOf(PropTypes.shape({
                    name: PropTypes.string.isRequired,
                    ingredients: PropTypes.arrayOf(PropTypes.string).isRequired,
                    calories: PropTypes.number.isRequired
                })).isRequired,
                specificInstructions: PropTypes.string
            })).isRequired
        }).isRequired
    };

    useEffect(() => {
        if (!searchTerm) {
            setFilteredDietPlans(dietPlans);
            return;
        }

        const filtered = dietPlans.filter(plan => {
            const patient = patients.find(p => p._id === plan.patientId);
            if (!patient) return false;

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
                        patient.diseases.toLowerCase().includes(searchLower)
                    );
                default:
                    return true;
            }
        });
        setFilteredDietPlans(filtered);
    }, [searchTerm, searchFilter, dietPlans, patients]);

    const SearchBar = () => (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search patient diet plans..."
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
                        <option value="name">Patient Name</option>
                        <option value="room">Room Number</option>
                        <option value="bed">Bed Number</option>
                        <option value="disease">Disease</option>
                    </select>
                </div>
            </div>
            {searchTerm && (
                <div className="mt-2 text-sm text-gray-600">
                    Found {filteredDietPlans.length} matching diet plans
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
                        <div className="text-xl text-gray-600">Loading diet plans...</div>
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
                        <div className="text-xl text-red-600">{error}</div>
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
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Diet Charts</h1>
                            <p className="text-sm text-gray-600">Manage patient diet plans and meals</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            {showForm ? 'Cancel' : 'Add New Diet Plan'}
                        </button>
                    </div>

                    {showForm && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Create New Diet Plan</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Patient
                                    </label>
                                    <select
                                        value={formData.patientId}
                                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                                        className="w-full p-3 border-2 border-gray-300 rounded-lg"
                                        required
                                    >
                                        <option value="">Select a patient</option>
                                        {patients.map(patient => (
                                            <option key={patient._id} value={patient._id}>
                                                {patient.name} - Room: {patient.roomNumber}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {formData.meals.map((meal, mealIndex) => (
                                    <div key={mealIndex} className="mb-8 p-4 border rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-center mb-4">
                                            <select
                                                value={meal.mealTime}
                                                onChange={(e) => {
                                                    const newMeals = [...formData.meals];
                                                    newMeals[mealIndex].mealTime = e.target.value;
                                                    setFormData({...formData, meals: newMeals});
                                                }}
                                                className="p-2 border rounded-md"
                                                required
                                            >
                                                {MEAL_TIMES.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                            
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newMeals = formData.meals.filter((_, idx) => idx !== mealIndex);
                                                    setFormData({...formData, meals: newMeals});
                                                }}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Remove Meal
                                            </button>
                                        </div>

                                        {meal.mealItems.map((item, itemIndex) => (
                                            <div key={itemIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Item name"
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const newMeals = [...formData.meals];
                                                        newMeals[mealIndex].mealItems[itemIndex].name = e.target.value;
                                                        setFormData({...formData, meals: newMeals});
                                                    }}
                                                    className="p-2 border rounded"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Ingredients (comma separated)"
                                                    value={item.ingredients.join(', ')}
                                                    onChange={(e) => {
                                                        const newMeals = [...formData.meals];
                                                        newMeals[mealIndex].mealItems[itemIndex].ingredients = 
                                                            e.target.value.split(',').map(i => i.trim());
                                                        setFormData({...formData, meals: newMeals});
                                                    }}
                                                    className="p-2 border rounded"
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Calories"
                                                    value={item.calories}
                                                    onChange={(e) => {
                                                        const newMeals = [...formData.meals];
                                                        newMeals[mealIndex].mealItems[itemIndex].calories = Number(e.target.value);
                                                        setFormData({...formData, meals: newMeals});
                                                    }}
                                                    className="p-2 border rounded"
                                                    required
                                                />
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newMeals = [...formData.meals];
                                                newMeals[mealIndex].mealItems.push({ 
                                                    name: '', 
                                                    ingredients: [], 
                                                    calories: 0 
                                                });
                                                setFormData({...formData, meals: newMeals});
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm mb-4"
                                        >
                                            + Add Item
                                        </button>

                                        <textarea
                                            placeholder="Specific Instructions (e.g., no salt, serve warm)"
                                            value={meal.specificInstructions}
                                            onChange={(e) => {
                                                const newMeals = [...formData.meals];
                                                newMeals[mealIndex].specificInstructions = e.target.value;
                                                setFormData({...formData, meals: newMeals});
                                            }}
                                            className="w-full p-2 border rounded mt-2"
                                        />
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleAddMeal}
                                    className="w-full mb-4 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500"
                                >
                                    + Add Another Meal
                                </button>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                >
                                    Save Diet Plan
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <SearchBar />
                        {filteredDietPlans.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                {searchTerm ? 'No matching diet plans found.' : 'No diet plans found. Create a new diet plan to get started.'}
                            </div>
                        ) : (
                            <div className="grid gap-6 p-6">
                                {filteredDietPlans.map((plan) => (
                                    <DietPlanCard key={plan._id} plan={plan} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DietChart;
