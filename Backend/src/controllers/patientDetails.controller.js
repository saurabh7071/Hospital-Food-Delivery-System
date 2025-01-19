import { PatientDetails } from '../models/patientDetails.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import mongoose from 'mongoose'

// Function to validate phone number format
const validatePhoneNumber = (phoneNumber) => /^\d{10}$/.test(phoneNumber);

// Create a new patient record
const createPatient = asyncHandler(async (req, res) => {
    const {
        patientName,
        diseases,
        allergies,
        roomNumber,
        bedNumber,
        floorNumber,
        age,
        gender,
        contactInformation,
        emergencyContact,
        additionalDetails
    } = req.body;

    // Input validation
    if ([patientName, diseases, allergies, roomNumber, bedNumber, floorNumber, age, gender, contactInformation, emergencyContact]
        .some(field => !field)) {
        throw new ApiError(400, 'All required fields must be provided');
    }

    // Validate phone numbers
    if (!validatePhoneNumber(contactInformation) || !validatePhoneNumber(emergencyContact)) {
        throw new ApiError(400, 'Invalid phone number format. Must be 10 digits');
    }

    // Ensure that age is a positive number
    if (age <= 0) {
        throw new ApiError(400, 'Age must be a positive number');
    }

    // Ensure that gender is one of the allowed values
    if (!['Male', 'Female', 'Other'].includes(gender)) {
        throw new ApiError(400, 'Gender must be Male, Female, or Other');
    }

    // Create new patient record
    try {
        const newPatient = new PatientDetails({
            patientName,
            diseases,
            allergies,
            roomNumber,
            bedNumber,
            floorNumber,
            age,
            gender,
            contactInformation,
            emergencyContact,
            additionalDetails
        });

        // Save patient record to the database
        await newPatient.save();

        return res
            .status(201)
            .json(new ApiResponse(201, 'Patient details added successfully', newPatient));

    } catch (error) {
        console.error('Error adding patient details:', error);
        return res.status(500).json({ message: 'Server error, please try again later', error: error.message });
    }
});

// Get all patient records
const getAllPatients = asyncHandler(async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10,
            search,
            searchField = 'all'
        } = req.query;

        // Build search query
        const query = {};
        if (search) {
            if (searchField === 'name') {
                query.patientName = { $regex: search, $options: 'i' };
            } else if (searchField === 'room') {
                query.roomNumber = search;
            } else if (searchField === 'bed') {
                query.bedNumber = search;
            } else if (searchField === 'disease') {
                query.diseases = { $regex: search, $options: 'i' };
            } else {
                // 'all' or default case
                query.$or = [
                    { patientName: { $regex: search, $options: 'i' } },
                    { roomNumber: search },
                    { bedNumber: search },
                    { diseases: { $regex: search, $options: 'i' } },
                    { contactInformation: { $regex: search, $options: 'i' } }
                ];
            }
        }

        // Get total count
        const totalCount = await PatientDetails.countDocuments(query);
        
        // Get paginated and filtered patients
        const patients = await PatientDetails.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: {
                patients,
                pagination: {
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        throw new ApiError(500, "Error fetching patients");
    }
});

// Get a specific patient by ID
const getPatientById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid patient ID');
    }

    try {
        const patient = await PatientDetails.findById(id);

        if (!patient) {
            throw new ApiError(404, 'Patient not found');
        }

        return res
            .status(200)
            .json(new ApiResponse(200, 'Patient retrieved successfully', patient));

    } catch (error) {
        console.error('Error fetching patient:', error);
        throw new ApiError(500, 'Server error, please try again later');
    }
});

// Update patient details by ID
const updatePatient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateFields = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid patient ID');
    }

    if (updateFields.contactInformation && !validatePhoneNumber(updateFields.contactInformation)) {
        throw new ApiError(400, 'Invalid contact information format');
    }

    if (updateFields.emergencyContact && !validatePhoneNumber(updateFields.emergencyContact)) {
        throw new ApiError(400, 'Invalid emergency contact format');
    }

    if (updateFields.age !== undefined && updateFields.age <= 0) {
        throw new ApiError(400, 'Age must be a positive number');
    }

    if (updateFields.gender && !['Male', 'Female', 'Other'].includes(updateFields.gender)) {
        throw new ApiError(400, 'Gender must be Male, Female, or Other');
    }

    try {
        const updatedPatient = await PatientDetails.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updatedPatient) {
            throw new ApiError(404, 'Patient not found');
        }

        return res
            .status(200)
            .json(new ApiResponse(200, 'Patient updated successfully', updatedPatient));

    } catch (error) {
        console.error('Error updating patient details:', error);
        throw new ApiError(500, 'Server error, please try again later');
    }
});

// Delete a patient record
const deletePatient = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid patient ID');
    }

    try {
        const deletedPatient = await PatientDetails.findByIdAndDelete(id);

        if (!deletedPatient) {
            throw new ApiError(404, 'Patient not found');
        }

        return res
            .status(200)
            .json(new ApiResponse(200, 'Patient details deleted successfully', deletedPatient));

    } catch (error) {
        console.error('Error deleting patient details:', error);
        throw new ApiError(500, 'Server error, please try again later');
    }
});

export {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient
};
