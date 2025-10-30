import { Pool } from "ppool";
import dotenv from "dotenv";

dotenv.config();

export const connection = new Pool({
  host: process.env.HOST || "localhost",
  port: 5432, // porta padrão PostgreSQL
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "0306",
  database: process.env.DATABASE || "projeto_filmes_db",
export const connection = mysql.createPool({
  host: process.env.HOST || 'localhost',
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || '36857756',
  database: process.env.DATABASE || 'projeto_filmes_db'
});

