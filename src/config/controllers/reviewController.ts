import { Response } from 'express'
import pool from '../database'
import { AuthRequest } from '../../middleware/authMiddleware'

export const approveSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const reviewerId = req.user?.userId
    const { notes } = req.body;

    try {
        //here we update the submission status to 'approved'
        const subResult = await pool.query(
            `UPDATE submissions SET status = 'approved' WHERE id = $1 RETURNING *`,
            [id]
        );

        if(subResult.rows.length === 0){
            res.status(404).json({error: 'Submission not found.'})
            return;
        }

        //inserting audit record in reviews table
        const reviewResult = await pool.query(
            `INSERT INTO reviews (submission_id, reviewer_id, action, notes) 
            VALUES ($1, $2, 'approved', $3) 
            RETURNING *`, 
            [id, reviewerId, notes || null]
        );

        res.status(200).json({
             message: 'Submission approved successfully!', 
             submission: subResult.rows, review: reviewResult.rows, 
            });
    } catch (error) {
        console.error('Error approving submission:', error)
        res.status(500).json({ error: 'Internal server error while approving submission.' });
    }
};