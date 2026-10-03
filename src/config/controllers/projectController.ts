import {Response} from 'express'
import pool from '../database'
import {AuthRequest} from '../../middleware/authMiddleware'

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
    const {title, description} = req.body;
    const ownerId = req.user?.userId;

    if(!title){
        res.status(400).json({error: 'Project  title is required.'});
        return;
    }

    try {
        const result = await pool.query(
            `INSERT INTO projects (title, description, owner_id)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [title, description || null, ownerId]
        );

        res.status(201).json({
            message: 'Project created successfully',
            project: result.rows[0],
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({error: 'Internal server eror while creating project.'});
    }
}