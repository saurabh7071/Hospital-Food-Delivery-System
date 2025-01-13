import mongoose, { Schema } from "mongoose"

const dietPlanSchema = new Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientDetails',
        required: true,
    },
    meals: [
        {
            mealTime: {
                type: String,
                enum: ['Morning', 'Evening', 'Night'],
                required: true,
            },
            mealItems: [
                {
                    name: {
                        type: String,
                        required: true,
                    },
                    ingredients: {
                        type: [String],
                        required: true,
                    },
                    calories: {
                        type: Number,
                        required: true,
                    },
                },
            ],
            specificInstructions: {
                type: String,
                default: '',
            },
        },
    ],
}, { timestamps: true });

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

export { DietPlan }