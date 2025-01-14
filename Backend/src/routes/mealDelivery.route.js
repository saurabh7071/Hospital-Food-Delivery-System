import { Router } from 'express';
import { 
    createMealDelivery, 
    updateMealDeliveryStatus, 
    getAllMealDeliveries, 
    getMealDeliveryById,
    updateDeliveryStatus
} from '../controllers/mealDelivery.controller.js';

const router = Router();

router.post('/create-meal-delivery', createMealDelivery);
router.get('/get-all-meal-deliveries', getAllMealDeliveries);
router.get('/get-meal-delivery-by-id/:id', getMealDeliveryById);
router.put('/update-meal-delivery-status/:id', updateMealDeliveryStatus);
router.put('/update-delivery-status/:id', updateDeliveryStatus);

export default router;