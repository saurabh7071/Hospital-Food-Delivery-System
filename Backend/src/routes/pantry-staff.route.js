import { Router } from 'express';
import { 
    createPantryStaff, 
    getAllPantryStaff, 
    getPantryStaffById, 
    updatePantryStaff, 
    deletePantryStaff 
} from '../controllers/pantry-staff.controller.js';

const router = Router();
    
router.post('/create-pantry-staff', createPantryStaff);
router.get('/get-all-pantry-staff', getAllPantryStaff);
router.get('/get-pantry-staff-by-id/:id', getPantryStaffById);
router.put('/update-pantry-staff/:id', updatePantryStaff);
router.delete('/delete-pantry-staff/:id', deletePantryStaff);

export default router; 