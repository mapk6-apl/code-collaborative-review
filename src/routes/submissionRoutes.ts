import { Router } from 'express'
import { createSubmission, getSubmissionsByProject, updateSubmissionStatus } from '../config/controllers/submissionController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = Router(); 

router.post('/', authenticateToken, createSubmission); 
router.get('/project/:projectId', authenticateToken, getSubmissionsByProject); 
router.patch('/:id/status', authenticateToken, updateSubmissionStatus); 

export default router;