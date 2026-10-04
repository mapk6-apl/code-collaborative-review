import { Router } from 'express'
import { addComment, getCommentsBySubmission } from '../config/controllers/commentController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = Router(); 

router.post('/', authenticateToken, addComment); 
router.get('/submission/:submissionId', authenticateToken, getCommentsBySubmission); 

export default router;