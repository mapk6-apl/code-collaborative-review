import { Response, NextFunction } from 'express'
import { AuthRequest } from './authMiddleware'

//restricts access to specific user roles (ex. reviewer, admin)
export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required.' })
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: `Access denied. Role '${req.user.role}' is not authorized to perform this action. Required: [${allowedRoles.join(', ')}]`,
            });
            return;
        }

        next();
    };
};

