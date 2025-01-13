import { Router } from 'express';
import { 
    createPantryStaff, 
    getAllPantryStaff, 
    getPantryStaffById, 
    updatePantryStaff, 
    deletePantryStaff 
} from '../controllers/pantry-staff.controller.js';

const router = Router();

router.post('/create-pantryStaff', createPantryStaff);
router.get('/get-all-pantryStaff', getAllPantryStaff);
router.get('/get-pantryStaff-by-id/:id', getPantryStaffById);
router.put('/update-pantryStaff/:id', updatePantryStaff);
router.delete('/delete-pantryStaff/:id', deletePantryStaff);

export default router; 