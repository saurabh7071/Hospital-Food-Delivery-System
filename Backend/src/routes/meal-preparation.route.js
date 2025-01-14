import { Router } from 'express';
import { 
    getAnalytics,
    getRecentDeliveries,
    getAlerts
} from '../controllers/mealPreparation.controller.js';

const router = Router();

router.get('/analytics', getAnalytics);
router.get('/recent-deliveries', getRecentDeliveries);
router.get('/alerts', getAlerts);

export default router; 