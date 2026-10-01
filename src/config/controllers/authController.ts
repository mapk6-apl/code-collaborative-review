import {Request, Response} from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../database'

//registering a new user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const {username, email, password, role} = req.body;

    //validation
    if(!username || !email || !password){
        res.status(400).json({error: 'Username, email and password are required.'})
        return;
    }

    try {
        //we check if a user exists using parameterized query
        const userCheck = await pool.query(
            'SELECT id FROM users WHERE email = \$1 OR username = \$2',
            [email, username]
        );

        if(userCheck.rows.length > 0) {
            res.status(409).json({error: 'User with this email or password already exists'})
            return;
        }

        //here we hash the password securely with a salt factor of 10
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)

        //inserting a new user into the database
        const userRole = role || 'developer' //if role not specified, defaults to developer
        const newUserResult = await pool.query(
            `INSERT INTO users (username, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role, created_at`,
            [username, email, passwordHash, userRole]
        );

        const newUser = newUserResult.rows[0];

        
    } catch (error) {
        
    }
}