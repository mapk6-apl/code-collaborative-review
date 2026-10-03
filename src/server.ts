import express, {Application, Request, Response} from 'express'
import dotenv from 'dotenv'
import pool from './config/database'
import authRoutes from './routes/authRoutes'
import projectRoutes from './routes/projectRoutes'

dotenv.config();

const app: Application = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(express.json()) //parses incoming requests (POST/PUT) with JSON payloads and populates req.body with the parsed JS object
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

//root route that verifies that the Express server is online and respoinding
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({message: 'Code Review API is runnning successfully.'})
});

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