import express, {Application, Request, Response} from 'express'
import dotenv from 'dotenv'
import pool from './config/database'
import authRoutes from './routes/authRoutes'
import projectRoutes from './routes/projectRoutes'
import submissionRoutes from './routes/submissionRoutes'
import commentRoutes from './routes/commentRoutes'
import reviewRoutes from './routes/reviewRoutes'
import analyticsRoutes from './routes/analyticsRoutes'
import {errorHandler} from './middleware/errorMiddleware'

dotenv.config();

const app: Application = express();

const PORT = Number(process.env.PORT) || 5001;

app.use(express.json()) //parses incoming requests (POST/PUT) with JSON payloads and populates req.body with the parsed JS object

//root route that verifies that the Express server is online and respoinding
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({message: 'Code Collaborative Review API is runnning successfully.'})
});

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/submissions', reviewRoutes);
app.use('/api', analyticsRoutes)
app.use(errorHandler) //centralized error handler

const startServer = async () => {
    try {
        //check client connection from db pool
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database')
        client.release(); //release client back to connection pool
        
        app.listen(PORT, () => {
            console.log(`Server is listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error)
        process.exit(1); //exit the node.js runtime process with an error code (1)
    }
};

//executes the server startup logic
startServer();