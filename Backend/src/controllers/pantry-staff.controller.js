import { PantryStaff } from "../models/pantry-staff.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Create Pantry Staff
const createPantryStaff = asyncHandler(async (req, res) => {
    const { name, contactNumber, location, role } = req.body;

    if (!name || !contactNumber || !location || !role) {
        throw new ApiError(400, "All fields are required: name, contactNumber, location, and role.");
    }

    if (name.length < 2 || name.length > 50) {
        throw new ApiError(400, "Name must be between 2 and 50 characters");
    }

    const validRoles = ["Pantry Staff", "Kitchen Staff", "Delivery Staff"];
    if (!validRoles.includes(role)) {
        throw new ApiError(400, `Invalid role. Allowed roles: ${validRoles.join(", ")}`);
    }

    if (!/^\d{10}$/.test(contactNumber)) {
        throw new ApiError(400, "Invalid contact number. Must be a 10-digit number.");
    }

    const existingStaff = await PantryStaff.findOne({ contactNumber });
    if (existingStaff) {
        throw new ApiError(400, "Contact number is already in use.");
    }

    const pantryStaff = await PantryStaff.create({
        name,
        contactNumber,
        location,
        role
    });

    // Select specific fields to return
    const staffResponse = await PantryStaff.findById(pantryStaff._id)
        .select('-__v');

    return res
        .status(201)
        .json(new ApiResponse(201, staffResponse, "Pantry staff created successfully"));
});

// Get All Pantry Staff
const getAllPantryStaff = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        role, 
        location,
        search,
        sortBy = 'createdAt',
        sortOrder = -1 
    } = req.query;

    const query = {};
    
    if (role) query.role = role;
    if (location) query.location = location;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { contactNumber: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const totalDocs = await PantryStaff.countDocuments(query);

    const pantryStaffList = await PantryStaff.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .select('-__v')
        .lean();

    if (!pantryStaffList?.length) {
        throw new ApiError(404, "No pantry staff found.");
    }

    const paginationInfo = {
        currentPage: Number(page),
        totalPages: Math.ceil(totalDocs / Number(limit)),
        totalResults: totalDocs,
        resultsPerPage: Number(limit)
    };

    return res
        .status(200)
        .json(new ApiResponse(200, "Pantry staff retrieved successfully", {
            staff: pantryStaffList,
            pagination: paginationInfo
        }));
});

// Get Pantry Staff by ID
const getPantryStaffById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid staff ID.");
    }

    const pantryStaff = await PantryStaff.findById(id)
        .select('-__v')
        .lean();
        
    if (!pantryStaff) {
        throw new ApiError(404, "Pantry staff not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Pantry staff retrieved successfully", pantryStaff));
});

// Update Pantry Staff
const updatePantryStaff = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid staff ID.");
    }

    if (!updates || Object.keys(updates).length === 0) {
        throw new ApiError(400, "No updates provided.");
    }

    const sanitizedUpdates = {};
    const allowedFields = ['name', 'contactNumber', 'location', 'role'];

    // Only allow specified fields to be updated
    Object.keys(updates).forEach(key => {
        if (!allowedFields.includes(key)) {
            throw new ApiError(400, `Field '${key}' cannot be updated`);
        }
        if (typeof updates[key] === 'string') {
            sanitizedUpdates[key] = updates[key].trim();
        }
    });

    if (sanitizedUpdates.name) {
        if (sanitizedUpdates.name.length < 2 || sanitizedUpdates.name.length > 50) {
            throw new ApiError(400, "Name must be between 2 and 50 characters");
        }
    }

    if (updates.role) {
        const validRoles = ["Pantry Staff", "Kitchen Staff", "Delivery Staff"];
        if (!validRoles.includes(sanitizedUpdates.role)) {
            throw new ApiError(400, `Invalid role. Allowed roles: ${validRoles.join(", ")}`);
        }
    }

    if (sanitizedUpdates.contactNumber) {
        if (!/^\d{10}$/.test(sanitizedUpdates.contactNumber)) {
            throw new ApiError(400, "Invalid contact number. Must be a 10-digit number.");
        }
        // Check if contact number is already in use by another staff
        const existingStaff = await PantryStaff.findOne({
            contactNumber: sanitizedUpdates.contactNumber,
            _id: { $ne: id }
        });
        if (existingStaff) {
            throw new ApiError(400, "Contact number is already in use by another staff member.");
        }
    }

    const updatedStaff = await PantryStaff.findByIdAndUpdate(
        id, 
        sanitizedUpdates, 
        { 
            new: true, 
            runValidators: true 
        }
    ).lean();

    if (!updatedStaff) {
        throw new ApiError(404, "Pantry staff not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Pantry staff updated successfully", updatedStaff));
});

// Delete Pantry Staff
const deletePantryStaff = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid staff ID.");
    }

    const staffExists = await PantryStaff.findById(id);
    if (!staffExists) {
        throw new ApiError(404, "Pantry staff not found.");
    }

    const deletedStaff = await PantryStaff.findByIdAndDelete(id)
        .select('-__v')
        .lean();

    return res
        .status(200)
        .json(new ApiResponse(200, "Pantry staff deleted successfully", {
            deletedStaff,
            message: "Staff and related data have been removed"
        }));
});

export { 
    createPantryStaff, 
    getAllPantryStaff, 
    getPantryStaffById, 
    updatePantryStaff, 
    deletePantryStaff 
};
