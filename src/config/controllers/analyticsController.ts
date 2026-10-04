import { Response } from 'express'
import pool from '../database'
import { AuthRequest } from '../../middleware/authMiddleware'

//user activity notifications
export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        //Aggregates recent submission comments and review decisions concerning the user 
        const commentsResult = await pool.query(
            `SELECT c.id, 'new_comment' as event_type, c.comment_text, c.created_at, u.username as actor 
            FROM comments c 
            JOIN users u ON c.author_id = u.id 
            JOIN submissions s ON c.submission_id = s.id 
            WHERE s.author_id = $1 
            ORDER BY c.created_at DESC LIMIT 10`,
            [id]
        );

        const reviewsResult = await pool.query(
            `SELECT r.id, 'review_action' as event_type, r.action as comment_text, r.created_at, u.username as actor 
            FROM reviews r 
            JOIN users u ON r.reviewer_id = u.id 
            JOIN submissions s ON r.submission_id = s.id 
            WHERE s.author_id = $1 
            ORDER BY r.created_at DESC LIMIT 10`,
            [id]
        );

        const activityFeed = [...commentsResult.rows, ...reviewsResult.rows].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        res.status(200).json({ userId: Number(id), notifications: activityFeed, });
    } catch (error) {
        console.error('Error fetching activity feed:', error)
        res.status(500).json({ error: 'Internal server error while retrieving activity feed.' });
    }
}

//project analytics dashboard
export const getProjectStats = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        //submission counts by status
        const statusStats = await pool.query(
            `SELECT status, COUNT(*)::int as count
            FROM submissions
            WHERE project_id = $1
            GROUP BY status`,
            [id]
        );

        //total comments on project submissions
        const commentsStats = await pool.query(
            `SELECT COUNT(c.id)::int as total_comments
            FROM comments c
            JOIN submissions s ON c.submission_id = s.id
            WHERE s.project_id = $1`,
            [id]
        );

        //most discussed submission
        const mostDiscussed = await pool.query(
            `SELECT s.id, s.title, COUNT(c.id)::int as comment_count
            FROM submissions s
            LEFT JOIN comments c ON s.id = c.submission_id
            WHERE s.project_id = $1
            GROUP BY s.id, s.title
            ORDER BY comment_count DESC LIMIT 1`,
            [id]
        );

        res.status(200).json({
            projectId: Number(id),
            statusBreakdown: statusStats.rows,
            totalComments: commentsStats.rows[0]?.total_comments || 0,
            mostDiscussedSubmission: mostDiscussed.rows || null,
        });
    } catch (error) {
        console.error('Error fetching project stats:', error);
        res.status(500).json({ error: 'Internal server error while fetching project stats.' });
    }
};