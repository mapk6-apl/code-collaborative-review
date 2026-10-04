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

//update submission status
export const updateSubmissionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    const {id} = req.params
    const {status} = req.body
    const validStatuses = ['pending', 'in\_review', 'approved', 'changes_requested'];
    if (!status || !validStatuses.includes(status)) {
        res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` }); 
        return; 
    } 
    
    try{
        const result = await pool.query(
            `UPDATE submissions 
            SET status = $1 
            WHERE id = $2 RETURNING *`, 
            [status, id] ); 
            
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Submission not found.' }); 
                return; 
            } 
            
            res.status(200).json({
                message: 'Submission status updated successfully!', 
                submission: result.rows[0], }); 
            } catch (error) { 
                console.error('Error updating status:', error)
                res.status(500).json({ error: 'Internal server error while updating status.' }
                ); 
            }
};
