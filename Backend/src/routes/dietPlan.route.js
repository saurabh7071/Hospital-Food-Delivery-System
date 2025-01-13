import { Router } from 'express';
import { 
    createDietPlan, 
    getAllDietPlans, 
    getDietPlanById, 
    updateDietPlan, 
    deleteDietPlan 
} from '../controllers/dietPlan.controller.js';

const router = Router();

router.post('/create-dietPlan', createDietPlan);
router.get('/get-all-dietPlans', getAllDietPlans);
router.get('/get-dietPlan-by-id/:id', getDietPlanById);
router.put('/update-dietPlan/:id', updateDietPlan);
router.delete('/delete-dietPlan/:id', deleteDietPlan);

export default router;
