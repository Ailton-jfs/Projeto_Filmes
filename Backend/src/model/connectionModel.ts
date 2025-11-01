import dotenv from "dotenv";
dotenv.config();

let connection: any;

if (process.env.DB_TYPE === "postgres") {
  const { Pool } = require("pg");
  connection = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  });
  console.log("🐘 Conectado ao PostgreSQL");
} else {
  const mysql = require("mysql2/promise");
  connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
  console.log("🦢 Conectado ao MySQL");
}

export { connection };
