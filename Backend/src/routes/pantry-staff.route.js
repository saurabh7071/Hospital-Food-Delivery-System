import { Router } from 'express';
import { 
    getAllStaff,
    getStaffPerformance
} from '../controllers/pantry-staff.controller.js';

const router = Router();

router.get('/get-all-staff', getAllStaff);
router.get('/performance', getStaffPerformance);

export default router; 