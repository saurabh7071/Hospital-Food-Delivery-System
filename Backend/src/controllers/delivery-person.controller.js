import { DeliveryPerson } from '../models/delivery-person.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

// Create a new delivery person
const createDeliveryPerson = asyncHandler(async (req, res) => {
    const { name, contactNumber } = req.body;

    if (!name || !contactNumber) {
        throw new ApiError(400, 'Name and contact number are required');
    }

    if (name.length < 2 || name.length > 50) {
        throw new ApiError(400, 'Name must be between 2 and 50 characters');
    }

    if (!/^\d{10}$/.test(contactNumber)) {
        throw new ApiError(400, 'Invalid contact number. It must be a 10-digit number');
    }

    const existingPerson = await DeliveryPerson.findOne({ contactNumber })
        .select('name contactNumber')
        .lean();

    if (existingPerson) {
        throw new ApiError(400, 'Contact number already exists');
    }

    const newDeliveryPerson = await DeliveryPerson.create({
        name,
        contactNumber
    });

    const deliveryPerson = await DeliveryPerson.findById(newDeliveryPerson._id)
        .select('-__v')
        .lean();

    return res
        .status(201)
        .json(new ApiResponse(
            201,
            'Delivery person created successfully',
            deliveryPerson
        ));
});

// Get all delivery persons
const getAllDeliveryPersons = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search
    } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { contactNumber: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const deliveryPersons = await DeliveryPerson.find(query)
        .select('name contactNumber')
        .skip(skip)
        .limit(Number(limit))
        .lean();

    if (!deliveryPersons?.length) {
        throw new ApiError(404, "No delivery persons found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, 'Delivery persons retrieved successfully', deliveryPersons));
});

// Get a delivery person by ID
const getDeliveryPersonById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid delivery person ID');
    }

    const deliveryPerson = await DeliveryPerson.findById(id)
        .select('name contactNumber')
        .lean();

    if (!deliveryPerson) {
        throw new ApiError(404, 'Delivery person not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, 'Delivery person retrieved successfully', deliveryPerson));
});

// Update a delivery person
const updateDeliveryPerson = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, contactNumber } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid delivery person ID');
    }

    if (!name && !contactNumber) {
        throw new ApiError(400, 'Please provide at least name or contact number to update');
    }

    const updates = {};
    
    if (name) {
        if (name.trim().length < 2 || name.trim().length > 50) {
            throw new ApiError(400, 'Name must be between 2 and 50 characters');
        }
        updates.name = name.trim();
    }

    if (contactNumber) {
        if (!/^\d{10}$/.test(contactNumber)) {
            throw new ApiError(400, 'Invalid contact number. It must be a 10-digit number');
        }

        const existingPerson = await DeliveryPerson.findOne({ contactNumber })
            .select('_id')
            .lean();
            
        if (existingPerson && existingPerson._id.toString() !== id) {
            throw new ApiError(400, 'Contact number already exists for another delivery person');
        }

        updates.contactNumber = contactNumber;
    }

    const updatedPerson = await DeliveryPerson.findByIdAndUpdate(
        id, 
        updates,
        {
            new: true,
            runValidators: true
        }
    ).select('name contactNumber');

    if (!updatedPerson) {
        throw new ApiError(404, 'Delivery person not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, 'Delivery person updated successfully', updatedPerson));
});

// Delete a delivery person
const deleteDeliveryPerson = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid delivery person ID');
    }

    const existingPerson = await DeliveryPerson.findById(id)
        .select('_id')
        .lean();

    if (!existingPerson) {
        throw new ApiError(404, 'Delivery person not found');
    }

    await DeliveryPerson.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            'Delivery person deleted successfully',
            { deletedId: id }
        ));
});

export {
    createDeliveryPerson,
    getAllDeliveryPersons,
    getDeliveryPersonById,
    updateDeliveryPerson,
    deleteDeliveryPerson,
};
