import { Router } from 'express'
import { getUserNotifications, getProjectStats } from '../config/controllers/analyticsController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = Router(); 

router.get('/users/:id/notifications', authenticateToken, getUserNotifications)
router.get('/projects/:id/stats', authenticateToken, getProjectStats)

export default router;