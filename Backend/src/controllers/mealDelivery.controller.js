import { MealDelivery } from '../models/mealDelivery.model.js';
import { MealPreparation } from '../models/mealPreparation.model.js';
import { DeliveryPerson } from '../models/delivery-person.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'; 
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

// Create Meal Delivery Record
const createMealDelivery = asyncHandler(async (req, res) => {
    const {
        mealPreparationId, 
        deliveryNotes, 
        deliveryPersonId 
    } = req.body;

    // Validate required fields
    if (!mealPreparationId || !mongoose.Types.ObjectId.isValid(mealPreparationId)) {
        throw new ApiError(400, 'Invalid or missing mealPreparationId');
    }

    if (!deliveryPersonId || !mongoose.Types.ObjectId.isValid(deliveryPersonId)) {
        throw new ApiError(400, 'Invalid or missing deliveryPersonId');
    }

    // Check if meal preparation and delivery person exist
    const [mealPreparation, deliveryPerson] = await Promise.all([
        MealPreparation.findById(mealPreparationId).lean(),
        DeliveryPerson.findById(deliveryPersonId).lean()
    ]);

    if (!mealPreparation) {
        throw new ApiError(404, 'Meal preparation not found');
    }

    if (!deliveryPerson) {
        throw new ApiError(404, 'Delivery person not found');
    }

    const mealDelivery = await MealDelivery.create({
        mealPreparationId,
        deliveryPersonId,
        deliveryStatus: 'Pending',
        deliveryNotes: deliveryNotes?.trim()
    });

    const populatedDelivery = await MealDelivery.findById(mealDelivery._id)
        .populate('mealPreparationId', 'meals')
        .populate('deliveryPersonId', 'name')
        .select('-__v')
        .lean();

    return res
        .status(201)
        .json(new ApiResponse(
            201, 
            'Meal delivery created successfully', 
            populatedDelivery
        ));
});

// Update Meal Delivery Status
const updateMealDeliveryStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { deliveryStatus, deliveryTime, deliveryNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid meal delivery ID');
    }

    const existingDelivery = await MealDelivery.findById(id)
        .select('deliveryStatus')
        .lean();

    if (!existingDelivery) {
        throw new ApiError(404, 'Meal delivery record not found');
    }

    const validStatuses = ['Pending', 'In Transit', 'Delivered', 'Failed'];
    if (deliveryStatus && !validStatuses.includes(deliveryStatus)) {
        throw new ApiError(400, `Invalid deliveryStatus. Must be one of: ${validStatuses.join(', ')}`);
    }

    if (deliveryStatus === 'Delivered' && !deliveryTime) {
        throw new ApiError(400, 'deliveryTime is required when status is Delivered');
    }

    if (deliveryTime && isNaN(Date.parse(deliveryTime))) {
        throw new ApiError(400, 'Invalid deliveryTime format');
    }

    const updates = {};
    if (deliveryStatus) updates.deliveryStatus = deliveryStatus;
    if (deliveryTime) updates.deliveryTime = new Date(deliveryTime);
    if (deliveryNotes) updates.deliveryNotes = deliveryNotes.trim();

    const updatedDelivery = await MealDelivery.findByIdAndUpdate(
        id,
        { $set: updates },
        { 
            new: true, 
            runValidators: true 
        }
    )
    .populate('mealPreparationId', 'meals')
    .populate('deliveryPersonId', 'name')
    .select('-__v')
    .lean();

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            'Meal delivery status updated successfully', 
            updatedDelivery
        ));
});

// Get All Meal Deliveries
const getAllMealDeliveries = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10,
        deliveryStatus
    } = req.query;

    const query = {};
    if (deliveryStatus) {
        query.deliveryStatus = deliveryStatus;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const mealDeliveries = await MealDelivery.find(query)
        .populate('mealPreparationId', 'meals patientId')
        .populate('deliveryPersonId', 'name contactNumber')
        .skip(skip)
        .limit(Number(limit))
        .select('-__v')
        .lean();

    if (!mealDeliveries?.length) {
        throw new ApiError(404, "No meal deliveries found");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            'Meal deliveries fetched successfully', 
            mealDeliveries
        ));
});

// Get Meal Delivery by ID
const getMealDeliveryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid meal delivery ID');
    }

    const mealDelivery = await MealDelivery.findById(id)
        .populate('mealPreparationId', 'meals patientId')
        .populate('deliveryPersonId', 'name contactNumber')
        .select('-__v')
        .lean();

    if (!mealDelivery) {
        throw new ApiError(404, 'Meal delivery record not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            'Meal delivery record fetched successfully', 
            mealDelivery
        ));
});

// Update Delivery Status
const updateDeliveryStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { deliveryStatus, deliveryNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid meal delivery ID');
    }

    const existingDelivery = await MealDelivery.findById(id)
        .select('deliveryStatus')
        .lean();

    if (!existingDelivery) {
        throw new ApiError(404, 'Meal delivery not found');
    }

    const validStatuses = ['Pending', 'In-Transit', 'Delivered', 'Failed'];
    if (!deliveryStatus || !validStatuses.includes(deliveryStatus)) {
        throw new ApiError(400, `Invalid deliveryStatus. Must be one of: ${validStatuses.join(', ')}`);
    }

    if (existingDelivery.deliveryStatus === 'Delivered') {
        throw new ApiError(400, 'Cannot update status of delivered meal');
    }

    const updates = {
        deliveryStatus,
        deliveryTime: deliveryStatus === 'Delivered' ? new Date() : null,
        ...(deliveryNotes && { deliveryNotes: deliveryNotes.trim() })
    };

    const updatedDelivery = await MealDelivery.findByIdAndUpdate(
        id,
        updates,
        { 
            new: true, 
            runValidators: true 
        }
    )
    .populate('mealPreparationId', 'meals')
    .populate('deliveryPersonId', 'name')
    .select('-__v')
    .lean();

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            `Delivery status updated to ${deliveryStatus}`, 
            updatedDelivery
        ));
});

export {
    createMealDelivery,
    updateMealDeliveryStatus,
    getAllMealDeliveries,
    getMealDeliveryById,
    updateDeliveryStatus,
};
