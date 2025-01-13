import mongoose, { Schema } from 'mongoose';

const mealPreparationSchema = new Schema({
    dietPlanId: {
        type: Schema.Types.ObjectId, 
        ref: 'DietPlan',
        required: true,
    },
    preparationStatus: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'Delivered'],
        default: 'Not Started',
    },
    assignedStaff: [
        {
            staffId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'PantryStaff',
                required: true,
            },
            role: {
                type: String,
                enum: ['Pantry Staff', 'Kitchen Staff', 'Delivery Staff'],
                required: true,
            },
        },
    ],
}, { timestamps: true });

const MealPreparation = mongoose.model('MealPreparation', mealPreparationSchema);

export { MealPreparation };
