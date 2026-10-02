import {Router} from 'express'
import {registerUser, loginUser} from '../config/controllers/authController'

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser)

export default router;