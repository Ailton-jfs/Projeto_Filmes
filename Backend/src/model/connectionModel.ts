import dotenv from "dotenv";
dotenv.config();

let connection: any = null;
const dbType = process.env.DB_TYPE || "mysql";

// 🔹 Cria uma nova conexão (MySQL ou PostgreSQL)
async function createConnection() {
  if (dbType === "postgres") {
    const { Pool } = await import("pg");
    const pool = new Pool({
      host: process.env.POSTGRES_HOST || "localhost",
      port: Number(process.env.POSTGRES_PORT) || 5432,
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "",
      database: process.env.POSTGRES_DATABASE || "postgres",
    });
    console.log("🐘 Conectado ao PostgreSQL");
    return pool;
  } else {
    const mysql = await import("mysql2/promise");
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "projeto_filmes_db",
    });
    console.log("🦢 Conectado ao MySQL");
    return pool;
  }
}

// 🔹 Função que garante que a conexão sempre exista
export async function getConnection() {
  if (!connection) {
    connection = await createConnection();
  }
  return connection;
}
