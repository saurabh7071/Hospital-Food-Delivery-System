import { Patient } from '../models/patient.model.js';
import { MealPreparation } from '../models/mealPreparation.model.js';
import { PantryStaff } from '../models/pantry-staff.model.js';

const getDashboardStats = async (req, res) => {
    try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalPatients,
            activePatients,
            pendingDeliveries,
            completedDeliveries,
            staffCount
        ] = await Promise.all([
            Patient.countDocuments(),
            Patient.countDocuments({ dischargeDate: null }),
            MealPreparation.countDocuments({ deliveryStatus: 'Pending' }),
            MealPreparation.countDocuments({
                deliveryStatus: 'Completed',
                updatedAt: { $gte: today }
            }),
            PantryStaff.countDocuments()
        ]);

        // Get meal distribution
        const mealDistribution = {
            Morning: await MealPreparation.countDocuments({ mealTime: 'Morning' }),
            Evening: await MealPreparation.countDocuments({ mealTime: 'Evening' }),
            Night: await MealPreparation.countDocuments({ mealTime: 'Night' })
        };

        // Get delivery status distribution
        const deliveryStatus = {
            pending: await MealPreparation.countDocuments({ deliveryStatus: 'Pending' }),
            inProgress: await MealPreparation.countDocuments({ deliveryStatus: 'In Progress' }),
            completed: await MealPreparation.countDocuments({ deliveryStatus: 'Completed' })
        };

        const stats = {
            totalPatients,
            activePatients,
            pendingDeliveries,
            completedDeliveries,
            staffCount,
            mealDistribution,
            deliveryStatus
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export { getDashboardStats }; 