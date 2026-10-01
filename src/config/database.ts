import {Pool} from 'pg';
import dotenv from 'dotenv';

//allows process.env to read the values from the .env file
dotenv.config();

//a connection pool maintains a cache of active, reusable connections instead of opening/closing a brand new DB connection for every HTTP request
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT ) || 5432 //process.env values are read as strings, so we convert DB_PORT to a Number
});

//Query Helper Function (wrapper function exported for executing SQL queries)
export const query = (text: string, params?: any[]) => {
    return pool.query(text, params);
};

export default pool;
