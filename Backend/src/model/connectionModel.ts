import { Pool } from "ppool";
import dotenv from "dotenv";

dotenv.config();

export const connection = new Pool({
  host: process.env.HOST || "localhost",
  port: 5432, // porta padrão PostgreSQL
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "0306",
  database: process.env.DATABASE || "projeto_filmes_db",
});

