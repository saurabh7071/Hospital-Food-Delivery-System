import { Router } from 'express';
import { 
    createPatient, 
    getAllPatients, 
    getPatientById, 
    updatePatient, 
    deletePatient 
} from '../controllers/patientDetails.controller.js';

const router = Router();

router.post('/create-patient', createPatient);
router.get('/get-all-patients', getAllPatients);
router.get('/get-patient-by-id/:id', getPatientById);
router.put('/update-patient/:id', updatePatient);
router.delete('/delete-patient/:id', deletePatient);

export default router;