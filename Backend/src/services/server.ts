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

// 🔹 Função principal assíncrona
async function startServer() {
  try {
    // 🧩 Seleciona tipo de banco a partir do .env
    const dbType = process.env.DB_TYPE || "mysql";

    let mysqlPool: any = null;
    let pgPool: any = null;

    if (dbType === "mysql") {
      // 🗄️ MySQL
      mysqlPool = await mysql.createPool({
        host: process.env.MYSQL_HOST || "localhost",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "projeto_filmes_db",
        port: Number(process.env.MYSQL_PORT) || 3306,
      });

      const [rows] = await mysqlPool.query("SELECT 1 + 1 AS result");
      console.log("🦢 Conectado ao MySQL:", rows);
    } 
    else if (dbType === "postgres") {
      // 🗄️ PostgreSQL
      pgPool = new Pool({
        host: process.env.POSTGRES_HOST || "localhost",
        port: Number(process.env.POSTGRES_PORT) || 5432,
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD || "",
        database: process.env.POSTGRES_DATABASE || "postgres",
      });

      const pgClient = await pgPool.connect();
      pgClient.release();
      console.log("🐘 Conectado ao PostgreSQL");
    } 
    else {
      throw new Error("❌ DB_TYPE inválido! Use 'mysql' ou 'postgres' no arquivo .env.");
    }

    // 🌐 Middleware global
    app.use(
      cors({
        origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type"],
      })
    );
    app.use(express.json());
    app.use(express.static(path.join(__dirname, "../../Frontend/public")));

    // 🧭 Rotas principais (TMDB + Banco + IA)
    app.use("/api", router);

    // 🧪 Teste rápido de banco
    app.get("/api/test-db", async (req, res) => {
      try {
        if (dbType === "mysql") {
          const [rows] = await mysqlPool.query("SELECT 1 + 1 AS result");
          return res.json({ success: true, db: "MySQL", result: rows });
        } else {
          const result = await pgPool.query("SELECT 1 + 1 AS result");
          return res.json({ success: true, db: "PostgreSQL", result: result.rows });
        }
      } catch (err) {
        console.error("❌ Erro no teste do banco:", err);
        res.status(500).json({ success: false, error: err });
      }
    });

    // 🏠 Rota raiz
    app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/public/index.html"));
});
    // 📄 Rota de recomendações
    app.get("/recomendacoes", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/public/recomendacoes.html"));
});

    // 🚀 Inicializa o servidor
    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar servidor:", err);
  }
}

// 🚀 Executa a função principal
startServer();
