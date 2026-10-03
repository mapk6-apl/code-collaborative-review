import { Response } from 'express'
import pool from '../../config/database'
import { AuthRequest } from '../../middleware/authMiddleware'

//creating code submission
export const createSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
    const { projectId, title, codeContent } = req.body
    const authorId = req.user?.userId

    if (!projectId || !title || !codeContent) {
        res.status(400).json({ error: 'Project ID, title, and code content are required.' })
        return;
    }

    try {
        const result = await pool.query(
            `INSERT INTO submissions (project_id, author_id, title, code_content, status) 
            VALUES ($1, $2, $3, $4, 'pending') 
            RETURNING *`,
            [projectId, authorId, title, codeContent]
        );

        res.status(201).json({
            message: 'Code snippet submitted for review successfully!',
            submission: result.rows[0],
        });
    } catch (error) {
        console.error('Error creating submission:', error)
        res.status(500).json({ error: 'Internal server error while uploading submission.' })
    }
};

//get submission for a projecf
export const getSubmissionsByProject = async (req: AuthRequest, res: Response): Promise<void> => {
    const { projectId } = req.params
    
    try{
        const result = await pool.query(
            `SELECT s.*, u.username as author_name 
            FROM submissions s 
            JOIN users u ON s.author_id = u.id 
            WHERE s.project_id = $1 
            ORDER BY s.created_at DESC`, 
            [projectId] 
        ); 
        
        res.status(200).json(result.rows); 
    } catch (error) {
        console.error('Error fetching submissions:', error)
        res.status(500).json({ error: 'Internal server error while fetching submissions.' }); 
    }
};