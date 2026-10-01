import express, {Application, Request, Response} from 'express'
import dotenv from 'dotenv'
import pool from './database'

dotenv.config();

const app: Application = express();

const PORT = process.env.PORT || 5000;

app.use(express.json()) //parses incoming requests (POST/PUT) with JSON payloads and populates req.body with the parsed JS object

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
    } catch (error) {
        
    }
}