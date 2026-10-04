import { Router } from 'express'
import { approveSubmission, requestChangesSubmission, getSubmissionReviews, } from '../config/controllers/reviewController'
import { authenticateToken } from '../middleware/authMiddleware'
import { authorizeRoles } from '../middleware/roleMiddleware'

const router = Router(); 

//Reviewers & Admins only can approve or request changes 
router.post( '/:id/approve', authenticateToken, authorizeRoles('reviewer', 'admin'), approveSubmission )
router.post( '/:id/request-changes', authenticateToken, authorizeRoles('reviewer', 'admin'), requestChangesSubmission ); 

//All authenticated members can view review history 
router.get('/:id/reviews', authenticateToken, getSubmissionReviews); 

export default router;