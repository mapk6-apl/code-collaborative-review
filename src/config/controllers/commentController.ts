import { Response } from 'express'
import pool from '../../config/database'
import { AuthRequest } from '../../middleware/authMiddleware'

//add a new comment
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
    const {submissionId, lineNumber, commentText} = req.body;
    const authorId = req.user?.userId;

    if(!submissionId || !commentText){
        res.status(400).json({error: 'Submission ID and comment text are required.'})
        return;
    }

    try {
        const result = await pool.query(
            `INSERT INTO comments (submission_id, author_id, line_number, comment_text) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`, 
            [submissionId, authorId, lineNumber || null, commentText]
        )
    } catch (error) {
        console.error('Error adding comment:', error)
        res.status(500).json({ error: 'Internal server error while posting comment.' });
    }
}

//get all comments for submission
export const getCommentsBySubmission = async (req: AuthRequest, res: Response): Promise<void> => {
    const {submissionId} = req.body;
    const authorId = req.user?.userId;

    try {
        const result = await pool.query(
            `SELECT c.*, u.username as author_name, u.role as author_role 
            FROM comments c 
            JOIN users u ON c.author_id = u.id 
            WHERE c.submission_id = $1 
            ORDER BY c.line_number ASC NULLS LAST, c.created_at ASC`,
            [submissionId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error)
        res.status(500).json({ error: 'Internal server error while fetching comments.' });
    }
}