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

        //generating JWT token for immediate login after registration
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            {userId: newUser.id, role: newUser.role},
            secret,
            {expiresIn: '24h'}
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser,
            token
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({error: 'Internal server error while registering user.'});
    }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const {email, password} = req.body || {};

    //basic validation
    if(!email || !password){
        res.status(400).json({error: 'Email and password are required'});
        return;
    }

    try {
        //fetching user by email using parameterized query
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if(result.rows.length === 0){
            res.status(401).json({error: 'Invalid email.'});
            return;
        }

        const user = result.rows[0];

        //we compare passwords using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if(!isPasswordValid){
            res.status(401).json({error: 'Invalid password.'})
            return;
        }

        //we then generate the JWT token
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            {userId: user.id, role: user.role},
            secret,
            {expiresIn: '24h'}
        );

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({error: 'Internal server error while loggin in.'})
    }
};