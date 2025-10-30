import express from "express";
import cors from "cors";
import { config } from "dotenv";
import router from "../routes/api"; // rotas principais
import { Pool } from "pg"; // PostgreSQL
import usuarioRouter from "../routes/usuarioRouter"; // suas rotas principais

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
// ✅ Middleware para CORS — deve vir antes das rotas
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"], // Live Server
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

// ✅ Middleware para interpretar JSON — deve vir antes das rotas
app.use(express.json());

// ✅ Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static("public"));

// ✅ Suas rotas principais
app.use("/api/usuarios", usuarioRouter);

// ✅ Rota simples para teste
app.get("/", (req, res) => {
  res.send("API funcionando! 🚀");
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
