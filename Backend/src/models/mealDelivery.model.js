import mongoose, { Schema } from 'mongoose';

const mealDeliverySchema = new Schema(
    {
        mealPreparationId: {
            type: Schema.Types.ObjectId,
            ref: 'MealPreparation',
            required: true,
        },
        deliveryStatus: {
            type: String,
            enum: ['Pending', 'In-Transit', 'Delivered', 'Failed'],
            default: 'Pending',
        },
        deliveryTime: {
            type: Date, 
            required: function () {
                return this.deliveryStatus === 'Delivered';
            },
        },
        deliveryNotes: {
            type: String,
            trim: true,
        },
        deliveryPersonId: {
            type: Schema.Types.ObjectId,
            ref: 'DeliveryPerson',
            required: true,
        },
    },
    { timestamps: true }
);

const MealDelivery = mongoose.model('MealDelivery', mealDeliverySchema);

export { MealDelivery };
