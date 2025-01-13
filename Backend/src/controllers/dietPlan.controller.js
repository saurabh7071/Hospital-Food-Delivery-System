import { DietPlan } from '../models/dietPlan.model.js';
import { PatientDetails } from '../models/patientDetails.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

// Helper function to validate meal structure
const validateMeals = (meals) => {
    if (!Array.isArray(meals) || meals.length === 0) {
        throw new ApiError(400, 'Meals must be a non-empty array');
    }

    meals.forEach((meal, index) => {
        if (!meal.mealTime || !['Morning', 'Evening', 'Night'].includes(meal.mealTime)) {
            throw new ApiError(400, `Meal at index ${index} must have a valid 'mealTime' (Morning, Evening, or Night)`);
        }
        if (!Array.isArray(meal.mealItems) || meal.mealItems.length === 0) {
            throw new ApiError(400, `Meal at index ${index} must have at least one 'mealItem'`);
        }
        meal.mealItems.forEach((item, itemIndex) => {
            if (!item.name || typeof item.name !== 'string') {
                throw new ApiError(400, `Meal item at index ${itemIndex} in meal ${index} must have a valid 'name'`);
            }
            if (!Array.isArray(item.ingredients) || item.ingredients.length === 0) {
                throw new ApiError(400, `Meal item at index ${itemIndex} in meal ${index} must have a non-empty 'ingredients' array`);
            }
            if (item.calories === undefined || typeof item.calories !== 'number' || item.calories <= 0){
                throw new ApiError(400, `Meal item at index ${itemIndex} in meal ${index} must have a valid 'calories' value`);
            }
        });
    });
};

// Create a new diet plan
const createDietPlan = asyncHandler(async (req, res) => {
    const { patientId, meals } = req.body;

    // Validate patient ID
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        throw new ApiError(400, 'Invalid patient ID');
    }

    // Check if the patient exists
    const patientExists = await PatientDetails.findById(patientId);
    if (!patientExists) {
        throw new ApiError(404, 'Patient not found');
    }

    // Validate meals structure
    validateMeals(meals);

    // Save the diet plan
    const dietPlan = new DietPlan({ patientId, meals });
    const savedDietPlan = await dietPlan.save();

    return res
        .status(201)
        .json(new ApiResponse(201, 'Diet plan created successfully', savedDietPlan));
});

// Get all diet plans
const getAllDietPlans = asyncHandler(async (req, res) => {
    const dietPlans = await DietPlan.find().populate('patientId', 'patientName age gender');

    if (!dietPlans.length) {
        throw new ApiError(404, 'No diet plans found');
    }
    return res
        .status(200)
        .json(new ApiResponse(200, 'Diet plans fetched successfully', dietPlans));
});

// Get a diet plan by ID
const getDietPlanById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate diet plan ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid diet plan ID');
    }

    const dietPlan = await DietPlan.findById(id).populate('patientId', 'patientName age gender');
    if (!dietPlan) {
        throw new ApiError(404, 'Diet plan not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, 'Diet plan fetched successfully', dietPlan));
});

// Update a diet plan
const updateDietPlan = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { meals, patientId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid diet plan ID');
    }

    const existingDietPlan = await DietPlan.findById(id);
    if (!existingDietPlan) {
        throw new ApiError(404, 'Diet plan not found');
    }

    if (patientId && !mongoose.Types.ObjectId.isValid(patientId)) {
        throw new ApiError(400, 'Invalid patient ID');
    }

    if (meals) {
        validateMeals(meals);
    }

    const updateData = {
        ...(meals && { meals }),
        ...(patientId && { patientId })
    };

    // Update the diet plan
    const updatedDietPlan = await DietPlan.findByIdAndUpdate(
        id, updateData, 
        {
            new: true,
            runValidators: true,
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, 'Diet plan updated successfully', updatedDietPlan));
});

// Delete a diet plan
const deleteDietPlan = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate diet plan ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid diet plan ID');
    }

    const deletedDietPlan = await DietPlan.findByIdAndDelete(id);
    if (!deletedDietPlan) {
        throw new ApiError(404, 'Diet plan not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, 'Diet plan deleted successfully', deletedDietPlan));
});

export { 
    createDietPlan, 
    getAllDietPlans, 
    getDietPlanById, 
    updateDietPlan, 
    deleteDietPlan 
};
