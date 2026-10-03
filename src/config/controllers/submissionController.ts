import {Response} from 'express'
import pool from '../../config/database'
import {AuthRequest} from '../../middleware/authMiddleware'

//creating code submission
export const createSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
    const { projectId, title, codeContent } = req.body
    const authorId = req.user?.userId
    
    if (!projectId || !title || !codeContent) { 
        res.status(400).json({ error: 'Project ID, title, and code content are required.' })
        return;
    }
}