import { Router } from 'express'
import { addComment, getCommentsBySubmission } from '../config/controllers/commentController'
import { authenticateToken } from '../middleware/authMiddleware'
import {authorizeRoles} from '../middleware/roleMiddleware'

const router = Router(); 

router.post('/', authenticateToken, authorizeRoles('reviewer', 'admin'), addComment); 
router.get('/submission/:submissionId', authenticateToken, getCommentsBySubmission); 

export default router;