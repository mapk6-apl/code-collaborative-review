import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

//extend Express Request interface to carry autenticated user detaiils
export interface AuthRequest extends Request {
    user?: {
        userId: number;
        role: string;
    }
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split('')[1];

    if(!token){
        res.status(401).json({error: 'Access token required. Please log in.'})
        return;
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret';

    jwt.verify(token, secret, (err, decoded) => {
        if(err){
            res.status(403).json({error: 'Invalid or expired access token.'});
            return;
        }

        req.user = decoded as {userId: number, role: string}
        next();
    });
};