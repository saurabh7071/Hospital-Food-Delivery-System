import mongoose, { Schema } from "mongoose"

const patientDetailsSchema = new Schema({
    patientName: {
        type: String,
        required: true,
        trim: true,
    },
    diseases: {
        type: [String],  
        required: true,
        default: [],
    },
    allergies: {
        type: [String],  
        required: true,
        default: [],
    },
    roomNumber: {
        type: String,
        required: true,
    },
    bedNumber: {
        type: String,
        required: true,
    },
    floorNumber: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
    },
    contactInformation: {
        type: String,
        required: true,
        match: /^\d{10}$/,  
    },
    emergencyContact: {
        type: String,
        required: true,
        match: /^\d{10}$/, 
    },
    additionalDetails: {
        type: String,  
        default: '',
    },
    admissionDate: {
        type: Date,
        default: Date.now,  
    },
    dischargeDate: {
        type: Date,
        default: null,  
    },
},{timestamps: true})


const PatientDetails = mongoose.model("PatientDetails", patientDetailsSchema)

export { PatientDetails }