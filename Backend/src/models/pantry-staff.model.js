import mongoose from 'mongoose';

const pantryStaffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    contactNumber: {
        type: String,
        required: true,
        match: /^\d{10}$/,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ["Pantry Staff", "Kitchen Staff", "Delivery Staff"],
        required: true,
        default: "Pantry Staff",
    },
}, { timestamps: true });

const PantryStaff = mongoose.model("PantryStaff", pantryStaffSchema);

export { PantryStaff };
