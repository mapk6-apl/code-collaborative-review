import { Request, Response, NextFunction } from 'express'
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

    console.log('1\. Auth Header Received:', authHeader);

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access token required. Please log in.' })
        return;
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret';

    try {
        const decoded = jwt.verify(token, secret) as { userId: number; role: string };
        console.log('2. Decoded User Payload:', decoded);

        req.user = decoded;
        next();
    } catch (err: any) {
        console.log('3. JWT Verify Error Reason:', err.message); // &lt;--- THIS WILL PRINT THE EXACT ERROR! 
        res.status(403).json({ error: 'Invalid or expired access token.' });
        return;
    }

};