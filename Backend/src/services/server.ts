import "dotenv/config";
import express from "express";
import cors from "cors";
import { config } from "dotenv";
import router from "../routes/api";
import { Pool } from "pg";
import mysql from "mysql2/promise";
import path from "path";

config();

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const dbType = process.env.DB_TYPE || "mysql";

    let mysqlPool: any = null;
    let pgPool: any = null;

    // -----------------------------------------------------
    // 🗄️ Conexão MySQL
    // -----------------------------------------------------
    if (dbType === "mysql") {
      mysqlPool = await mysql.createPool({
        host: process.env.MYSQL_HOST || "localhost",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "projeto_filmes_db",
        port: Number(process.env.MYSQL_PORT) || 3306,
      });

      await mysqlPool.query("SELECT 1");
      console.log("🦢 MySQL conectado!");
    }

    // -----------------------------------------------------
    // 🗄️ Conexão PostgreSQL
    // -----------------------------------------------------
    if (dbType === "postgres") {
      pgPool = new Pool({
        host: process.env.POSTGRES_HOST || "localhost",
        port: Number(process.env.POSTGRES_PORT) || 5432,
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD || "",
        database: process.env.POSTGRES_DATABASE || "postgres",
      });

      const client = await pgPool.connect();
      client.release();
      console.log("🐘 PostgreSQL conectado!");
    }

    // -----------------------------------------------------
    // 🌐 Middlewares
    // -----------------------------------------------------
    app.use(
      cors({
        origin: "*", // 🔥 libera tudo (para dev)
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type"],
      })
    );

    app.use(express.json());

    // -----------------------------------------------------
    // 🧪 Teste rápido DB
    // -----------------------------------------------------
    app.get("/api/test-db", async (req, res) => {
      try {
        if (dbType === "mysql") {
          const [rows] = await mysqlPool.query("SELECT 1 + 1 AS result");
          return res.json({ ok: true, db: "mysql", result: rows });
        } else {
          const result = await pgPool.query("SELECT 1 + 1 AS result");
          return res.json({ ok: true, db: "postgres", result: result.rows });
        }
      } catch (err) {
        return res.status(500).json({ ok: false, error: err });
      }
    });

    // -----------------------------------------------------
    // 🧭 Rotas API
    // -----------------------------------------------------
    app.use("/api", router);

    // -----------------------------------------------------
    // 🚀 Servir Frontend
    // -----------------------------------------------------
    const publicPath = path.join(__dirname, "../../Frontend/public");
    app.use(express.static(publicPath));

    app.get("/", (req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });

    app.get("/recomendacoes", (req, res) => {
      res.sendFile(path.join(publicPath, "recomendacoes.html"));
    });

    // -----------------------------------------------------
    // ▶ Iniciar servidor
    // -----------------------------------------------------
    app.listen(PORT, () => {
      console.log(`💻 Servidor rodando em: http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Erro ao iniciar servidor:", err);
  }
}

startServer();
