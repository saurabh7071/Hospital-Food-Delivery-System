import mongoose, { Schema } from 'mongoose';

const deliveryPersonSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        contactNumber: {
            type: String,
            required: true,
            unique: true,
            match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number'], // Adjust regex as per requirements
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

const DeliveryPerson = mongoose.model('DeliveryPerson', deliveryPersonSchema);

export { DeliveryPerson };
