import { Router } from 'express';
import { 
    createMealPreparation, 
    getAllMealPreparations, 
    getMealPreparationById, 
    updateMealPreparation, 
    deleteMealPreparation,
    updateMealPreparationStatus
} from '../controllers/mealPreparation.controller.js';

const router = Router();

router.post('/create-meal', createMealPreparation);
router.get('/get-all-meals', getAllMealPreparations);
router.get('/get-meal-by-id/:id', getMealPreparationById);
router.put('/update-meal/:id', updateMealPreparation);
router.delete('/delete-meal/:id', deleteMealPreparation);
router.put('/update-meal-status/:id', updateMealPreparationStatus);

export default router;
