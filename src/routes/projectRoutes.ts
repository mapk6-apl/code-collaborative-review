import {Router} from 'express'
import {createProject, getProjects} from '../controllers/projectController'
import {authenticateToken} from '../middleware/authMiddleware'

const router = Router();

//protect project routes with jwt authentication
router.post('/', authenticateToken, createProject);
router.get('/', authenticateToken, getProjects)

export default router;
