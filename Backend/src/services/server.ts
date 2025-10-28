import express from "express";
import cors from "cors";
import { config } from "dotenv";
import router from "../routes/api"; // rotas principais
import { Pool } from "pg"; // PostgreSQL

// Carrega variáveis do .env
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.HOST,
  port: 5432, // porta padrão PostgreSQL
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

// Middleware
app.use(cors());
app.use(express.json());

// Rotas principais (prefixadas com /api)
app.use("/api", router);

// Endpoint de teste de conexão
app.get("/api/test-db", async (req, res) => {
  try {
    const client = await pool.connect();
    client.release();
    res.json({ success: true, message: "✅ Conexão com PostgreSQL OK!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "❌ Falha na conexão", error: err });
  }
});

// Servir HTML e CSS (se estiver na pasta public)
app.use(express.static("public"));

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
