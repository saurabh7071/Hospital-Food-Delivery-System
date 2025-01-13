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
            match: /^\d{10}$/,
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

const DeliveryPerson = mongoose.model('DeliveryPerson', deliveryPersonSchema);

export { DeliveryPerson };
