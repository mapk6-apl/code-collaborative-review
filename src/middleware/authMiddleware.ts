import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

//extend Express Request interface to carry autenticated user detaiils
export interface AuthRequest extends Request {
    users?: {
        userId: number;
        role: string;
    }
}
