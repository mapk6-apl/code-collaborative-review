import {Router} from 'express'
import {registerUser} from '../config/controllers/authController'

const router = Router();

router.post('/register', registerUser);

export default router;