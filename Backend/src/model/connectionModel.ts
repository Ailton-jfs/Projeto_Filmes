import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const connection = mysql.createPool({
  host: process.env.HOST || 'localhost',
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || '36857756',
  database: process.env.DATABASE || 'LOJA'
});

