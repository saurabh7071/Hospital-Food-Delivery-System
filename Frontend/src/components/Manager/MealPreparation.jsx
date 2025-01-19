import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import PropTypes from 'prop-types';

const MEAL_TIMES = ['Morning', 'Evening', 'Night'];

const MealPreparation = () => {
    const [preparations, setPreparations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffMembers, setStaffMembers] = useState([]);
    const [dietPlans, setDietPlans] = useState([]);
    const [patients, setPatients] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [assignmentForm, setAssignmentForm] = useState({
        dietPlanId: '',
        staffId: '',
        mealTime: MEAL_TIMES[0]
    });

    const checkForDelays = useCallback(() => {
        const currentTime = new Date();
        const newAlerts = [];

        preparations.forEach(prep => {
            const mealTime = prep.mealTime;
            const expectedTime = getExpectedTime(mealTime);
            
            if (currentTime > expectedTime && prep.preparationStatus !== 'Completed') {
                newAlerts.push({
                    id: prep._id,
                    type: 'delay',
                    message: `${mealTime} meal preparation is delayed`,
                    mealTime
                });
            }

            if (prep.preparationStatus === 'Completed' && prep.deliveryStatus !== 'Delivered') {
                newAlerts.push({
                    id: prep._id,
                    type: 'delivery',
                    message: `${mealTime} meal delivery is pending`,
                    mealTime
                });
            }
        });

        setAlerts(newAlerts);
    }, [preparations]);

    useEffect(() => {
        fetchInitialData();
        const interval = setInterval(checkForDelays, 60000);
        return () => clearInterval(interval);
    }, [checkForDelays]);

    const fetchInitialData = async () => {
        try {
            const [prepsRes, staffRes, dietsRes, patientsRes] = await Promise.all([
                axios.get('/api/v1/meal-preparation/get-all'),
                axios.get('/api/v1/pantry-staff/get-all-staff'),
                axios.get('/api/v1/diet-plan/get-all-diet-plans'),
                axios.get('/api/v1/patient-details/get-all-patients')
            ]);

            setPreparations(prepsRes.data.data || []);
            setStaffMembers(staffRes.data.data || []);
            setDietPlans(dietsRes.data.data || []);
            setPatients(patientsRes.data.data || []);
        } catch (err) {
            toast.error('Error loading data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getExpectedTime = (mealTime) => {
        const now = new Date();
        const times = {
            'Morning': new Date(now.setHours(8, 0, 0)),
            'Evening': new Date(now.setHours(13, 0, 0)),
            'Night': new Date(now.setHours(19, 0, 0))
        };
        return times[mealTime];
    };

    const handleAssignMeal = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/v1/meal-preparation/assign', {
                ...assignmentForm,
                preparationStatus: 'Pending',
                deliveryStatus: 'Pending'
            });
            toast.success('Meal assigned successfully');
            setShowAssignForm(false);
            setAssignmentForm({
                dietPlanId: '',
                staffId: '',
                mealTime: MEAL_TIMES[0]
            });
            fetchInitialData();
        } catch (err) {
            toast.error('Failed to assign meal: ' + err.message);
        }
    };

    const AlertBanner = () => (
        <div className="mb-6">
            {alerts.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Attention needed
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    {alerts.map((alert, index) => (
                                        <li key={index}>{alert.message}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const PreparationCard = ({ preparation }) => {
        const dietPlan = dietPlans.find(dp => dp._id === preparation.dietPlanId);
        const patient = patients.find(p => p._id === dietPlan?.patientId);
        const assignedStaff = staffMembers.find(s => s._id === preparation.assignedStaffId);

        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            {patient?.name || 'Unknown Patient'} - {preparation.mealTime}
                        </h3>
                        <p className="text-sm text-gray-600">
                            Room: {patient?.roomNumber}, Bed: {patient?.bedNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                            Assigned to: {assignedStaff?.name || 'Unassigned'}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Preparation:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                preparation.preparationStatus === 'Completed' 
                                    ? 'bg-green-100 text-green-800'
                                    : preparation.preparationStatus === 'In Progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {preparation.preparationStatus || 'Pending'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Delivery:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                preparation.deliveryStatus === 'Delivered' 
                                    ? 'bg-green-100 text-green-800'
                                    : preparation.deliveryStatus === 'In Progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {preparation.deliveryStatus || 'Pending'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {dietPlan?.meals
                        .filter(meal => meal.mealTime === preparation.mealTime)
                        .map((meal, index) => (
                            <div key={index} className="pl-4 border-l-2 border-gray-200">
                                <ul className="list-disc list-inside pl-4 text-sm text-gray-600">
                                    {meal.mealItems.map((item, idx) => (
                                        <li key={idx}>
                                            {item.name} ({item.ingredients.join(', ')})
                                        </li>
                                    ))}
                                </ul>
                                {meal.specificInstructions && (
                                    <p className="text-sm text-red-600 mt-1">
                                        Note: {meal.specificInstructions}
                                    </p>
                                )}
                            </div>
                        ))}
                </div>
            </div>
        );
    };

    PreparationCard.propTypes = {
        preparation: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            dietPlanId: PropTypes.string.isRequired,
            mealTime: PropTypes.string.isRequired,
            preparationStatus: PropTypes.string.isRequired,
            deliveryStatus: PropTypes.string.isRequired,
            assignedStaffId: PropTypes.string.isRequired
        }).isRequired
    };

    if (loading) {
        return (
            <>
                <Navbar userName="Hospital Manager" />
                <div className="lg:ml-64 p-4">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-xl text-gray-600">Loading meal preparations...</div>
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
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Meal Preparation Status</h1>
                            <p className="text-sm text-gray-600">Track meal preparations and deliveries</p>
                        </div>
                        <button
                            onClick={() => setShowAssignForm(!showAssignForm)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            {showAssignForm ? 'Cancel' : 'Assign Meal'}
                        </button>
                    </div>

                    {showAssignForm && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Assign Meal to Staff</h2>
                            <form onSubmit={handleAssignMeal} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Diet Plan
                                    </label>
                                    <select
                                        value={assignmentForm.dietPlanId}
                                        onChange={(e) => setAssignmentForm({
                                            ...assignmentForm,
                                            dietPlanId: e.target.value
                                        })}
                                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select a diet plan</option>
                                        {dietPlans.map(plan => {
                                            const patient = patients.find(p => p._id === plan.patientId);
                                            return (
                                                <option key={plan._id} value={plan._id}>
                                                    {patient?.name || 'Unknown'} - Room: {patient?.roomNumber}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Staff Member
                                    </label>
                                    <select
                                        value={assignmentForm.staffId}
                                        onChange={(e) => setAssignmentForm({
                                            ...assignmentForm,
                                            staffId: e.target.value
                                        })}
                                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select a staff member</option>
                                        {staffMembers
                                            .filter(staff => staff.role === "Pantry Staff")
                                            .map(staff => (
                                                <option key={staff._id} value={staff._id}>
                                                    {staff.name} - {staff.location}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Meal Time
                                    </label>
                                    <select
                                        value={assignmentForm.mealTime}
                                        onChange={(e) => setAssignmentForm({
                                            ...assignmentForm,
                                            mealTime: e.target.value
                                        })}
                                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    >
                                        {MEAL_TIMES.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                    >
                                        Assign Meal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <AlertBanner />

                    <div className="space-y-6">
                        {MEAL_TIMES.map(mealTime => (
                            <div key={mealTime} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b">
                                    <h2 className="text-xl font-semibold text-gray-800">{mealTime} Meals</h2>
                                </div>
                                <div className="p-6">
                                    {preparations
                                        .filter(prep => prep.mealTime === mealTime)
                                        .map(preparation => (
                                            <PreparationCard 
                                                key={preparation._id} 
                                                preparation={preparation} 
                                            />
                                        ))
                                    }
                                    {preparations.filter(prep => prep.mealTime === mealTime).length === 0 && (
                                        <p className="text-gray-500 text-center">No meals scheduled for this time</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MealPreparation; 