import { MealPreparation } from '../models/mealPreparation.model.js';
import { DietPlan } from '../models/dietPlan.model.js';
import { PantryStaff } from '../models/pantry-staff.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

// Create a new meal preparation record
const createMealPreparation = asyncHandler(async (req, res) => {
    const { dietPlanId, assignedStaff } = req.body;

    // Validate dietPlanId
    if (!dietPlanId || !mongoose.Types.ObjectId.isValid(dietPlanId)) {
        throw new ApiError(400, 'Invalid or missing dietPlanId');
    }

    // Check if the diet plan exists and populate essential details
    const dietPlan = await DietPlan.findById(dietPlanId)
        .select('meals status patientId')
        .lean();

    if (!dietPlan) {
        throw new ApiError(404, 'Diet plan not found');
    }

    // Check if diet plan is active/valid for meal preparation
    if (dietPlan.status === 'cancelled' || dietPlan.status === 'completed') {
        throw new ApiError(400, 'Cannot create meal preparation for inactive diet plan');
    }

    // Validate assignedStaff structure
    if (!Array.isArray(assignedStaff) || assignedStaff.length === 0) {
        throw new ApiError(400, 'assignedStaff must be a non-empty array');
    }

    // Validate staff roles and existence
    const validRoles = ["Pantry Staff", "Kitchen Staff", "Delivery Staff"];
    const staffPromises = assignedStaff.map(async (staff) => {
        // Validate staff object structure
        if (!staff?.staffId || !staff?.role) {
            throw new ApiError(400, 'Each staff entry must have staffId and role');
        }

        // Validate staffId
        if (!mongoose.Types.ObjectId.isValid(staff.staffId)) {
            throw new ApiError(400, `Invalid staffId format: ${staff.staffId}`);
        }

        // Validate role
        if (!validRoles.includes(staff.role)) {
            throw new ApiError(400, `Invalid role: ${staff.role}. Allowed roles: ${validRoles.join(", ")}`);
        }

        // Check if staff exists
        const staffMember = await PantryStaff.findById(staff.staffId)
            .select('name role')
            .lean();

        if (!staffMember) {
            throw new ApiError(404, `Staff with ID ${staff.staffId} not found`);
        }

        return {
            ...staff,
            staffDetails: staffMember // Keep staff details for response
        };
    });

    // Wait for all staff validations to complete
    await Promise.all(staffPromises);

    // Create the meal preparation record
    const mealPreparation = await MealPreparation.create({
        dietPlanId,
        assignedStaff,
        status: 'pending',
        createdAt: new Date()
    });

    // Fetch the created record with populated data
    const populatedMealPrep = await MealPreparation.findById(mealPreparation._id)
        .populate('dietPlanId', 'meals patientId')
        .populate('assignedStaff.staffId', 'name role')
        .select('-__v')
        .lean();

    return res
        .status(201)
        .json(new ApiResponse(201, 'Meal preparation record created successfully', populatedMealPrep));
});

// Get all meal preparation records
const getAllMealPreparations = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        status,
        staffId,
        dietPlanId,
        sortBy = 'createdAt',
        sortOrder = -1
    } = req.query;

    // Build query
    const query = {};
    
    // Add filters if provided
    if (status) query.status = status;
    if (staffId) query['assignedStaff.staffId'] = staffId;
    if (dietPlanId) query.dietPlanId = dietPlanId;

    // Calculate skip for pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count for pagination
    const totalDocs = await MealPreparation.countDocuments(query);

    // Fetch meal preparations with pagination and sorting
    const mealPreparations = await MealPreparation.find(query)
        .populate({
            path: 'dietPlanId',
            select: 'meals patientId status',
            populate: {
                path: 'patientId',
                select: 'firstName lastName'
            }
        })
        .populate('assignedStaff.staffId', 'name contactNumber role')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .select('-__v')
        .lean();

    if (!mealPreparations?.length) {
        throw new ApiError(404, "No meal preparation records found");
    }

    // Prepare pagination info
    const paginationInfo = {
        currentPage: Number(page),
        totalPages: Math.ceil(totalDocs / Number(limit)),
        totalResults: totalDocs,
        resultsPerPage: Number(limit)
    };

    return res
        .status(200)
        .json(new ApiResponse(200, 'Meal preparation records fetched successfully', {
            mealPreparations,
            pagination: paginationInfo
        }));
});

// Get a meal preparation record by ID
const getMealPreparationById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid meal preparation ID');
    }

    const mealPreparation = await MealPreparation.findById(id)
        .populate({
            path: 'dietPlanId',
            select: 'meals patientId status',
            populate: {
                path: 'patientId',
                select: 'firstName lastName'
            }
        })
        .populate('assignedStaff.staffId', 'name contactNumber role')
        .select('-__v')
        .lean();

    if (!mealPreparation) {
        throw new ApiError(404, 'Meal preparation record not found');
    }

    const enrichedMealPrep = {
        ...mealPreparation,
        totalStaffAssigned: mealPreparation.assignedStaff.length,
        staffRoles: mealPreparation.assignedStaff.map(staff => staff.role),
    };

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            'Meal preparation record fetched successfully', 
            enrichedMealPrep
        ));
});

// Update meal preparation status or staff
const updateMealPreparation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { preparationStatus, assignedStaff } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid meal preparation ID');
    }

    const existingPrep = await MealPreparation.findById(id);
    if (!existingPrep) {
        throw new ApiError(404, 'Meal preparation record not found');
    }

    if (!preparationStatus && !assignedStaff) {
        throw new ApiError(400, 'No valid updates provided');
    }

    const validStatuses = ['Not Started', 'In Progress', 'Completed', 'Delivered'];
    if (preparationStatus) {
        if (!validStatuses.includes(preparationStatus)) {
            throw new ApiError(400, `Invalid preparation status. Allowed values: ${validStatuses.join(', ')}`);
        }

        if (existingPrep.preparationStatus === 'Delivered' && preparationStatus !== 'Delivered') {
            throw new ApiError(400, 'Cannot change status of delivered meal preparation');
        }
    }

    if (assignedStaff) {
        if (!Array.isArray(assignedStaff) || assignedStaff.length === 0) {
            throw new ApiError(400, 'assignedStaff must be a non-empty array');
        }

        const validRoles = ['Pantry Staff', 'Kitchen Staff', 'Delivery Staff'];
        const staffPromises = assignedStaff.map(async (staff) => {
            if (!staff?.staffId || !staff?.role) {
                throw new ApiError(400, 'Each staff entry must have staffId and role');
            }

            if (!mongoose.Types.ObjectId.isValid(staff.staffId)) {
                throw new ApiError(400, `Invalid staffId format: ${staff.staffId}`);
            }

            if (!validRoles.includes(staff.role)) {
                throw new ApiError(400, `Invalid role: ${staff.role}. Allowed roles: ${validRoles.join(', ')}`);
            }

            const staffMember = await PantryStaff.findById(staff.staffId)
                .select('name role')
                .lean();

            if (!staffMember) {
                throw new ApiError(404, `Staff with ID ${staff.staffId} not found`);
            }

            return staffMember;
        });

        // Wait for all staff validations to complete
        await Promise.all(staffPromises);
    }

    // Create updates object
    const updates = {};
    if (preparationStatus) updates.preparationStatus = preparationStatus;
    if (assignedStaff) updates.assignedStaff = assignedStaff;
    updates.updatedAt = new Date();

    // Update the record
    const updatedPrep = await MealPreparation.findByIdAndUpdate(
        id,
        updates,
        { 
            new: true, 
            runValidators: true 
        }
    )
    .populate('dietPlanId', 'meals patientId')
    .populate('assignedStaff.staffId', 'name role')
    .select('-__v')
    .lean();

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            'Meal preparation updated successfully', 
            updatedPrep
        ));
});

// Delete a meal preparation record
const deleteMealPreparation = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid meal preparation ID');
    }

    const existingPrep = await MealPreparation.findById(id)
        .select('preparationStatus')
        .lean();

    if (!existingPrep) {
        throw new ApiError(404, 'Meal preparation record not found');
    }

    if (['Completed', 'Delivered'].includes(existingPrep.preparationStatus)) {
        throw new ApiError(400, 'Cannot delete completed or delivered meal preparations');
    }

    const deletedPrep = await MealPreparation.findByIdAndDelete(id)
        .populate('dietPlanId', 'meals patientId')
        .populate('assignedStaff.staffId', 'name role')
        .select('-__v')
        .lean();

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            'Meal preparation record deleted successfully', 
            {
                deletedRecord: deletedPrep,
                message: 'All related data has been cleaned up'
            }
        ));
});

const updateMealPreparationStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { preparationStatus } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid meal preparation ID');
    }

    // Check if meal preparation exists
    const existingPrep = await MealPreparation.findById(id)
        .select('preparationStatus')
        .lean();

    if (!existingPrep) {
        throw new ApiError(404, 'Meal preparation record not found');
    }

    // Validate status
    const validStatuses = ['Not Started', 'In Progress', 'Completed', 'Delivered'];
    if (!preparationStatus || !validStatuses.includes(preparationStatus)) {
        throw new ApiError(400, `Invalid preparation status. Allowed values: ${validStatuses.join(', ')}`);
    }

    // Validate status transition
    if (existingPrep.preparationStatus === 'Delivered') {
        throw new ApiError(400, 'Cannot update status of delivered meal preparation');
    }

    const statusOrder = {
        'Not Started': 0,
        'In Progress': 1,
        'Completed': 2,
        'Delivered': 3
    };

    if (statusOrder[preparationStatus] < statusOrder[existingPrep.preparationStatus]) {
        throw new ApiError(400, `Cannot change status from ${existingPrep.preparationStatus} to ${preparationStatus}`);
    }

    // Update the status
    const updatedPrep = await MealPreparation.findByIdAndUpdate(
        id,
        {
            preparationStatus,
            updatedAt: new Date(),
            [`statusHistory.${preparationStatus}At`]: new Date()
        },
        { 
            new: true,
            runValidators: true 
        }
    )
    .populate({
        path: 'dietPlanId',
        select: 'meals patientId',
        populate: {
            path: 'patientId',
            select: 'firstName lastName'
        }
    })
    .populate('assignedStaff.staffId', 'name role')
    .select('-__v')
    .lean();

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            `Meal preparation status updated to ${preparationStatus}`,
            updatedPrep
        ));
});

export { 
    createMealPreparation, 
    getAllMealPreparations, 
    getMealPreparationById, 
    updateMealPreparation, 
    deleteMealPreparation,
    updateMealPreparationStatus
};


