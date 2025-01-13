import { Router } from 'express';
import { 
    createDeliveryPerson, 
    getAllDeliveryPersons, 
    getDeliveryPersonById, 
    updateDeliveryPerson, 
    deleteDeliveryPerson 
} from '../controllers/delivery-person.controller.js';

const router = Router();

router.post('/create-delivery-person', createDeliveryPerson);
router.get('/get-all-delivery-persons', getAllDeliveryPersons);
router.get('/get-delivery-person-by-id/:id', getDeliveryPersonById);
router.put('/update-delivery-person/:id', updateDeliveryPerson);
router.delete('/delete-delivery-person/:id', deleteDeliveryPerson);

export default router;