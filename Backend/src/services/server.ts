import express from "express";
import cors from "cors";
import { config } from "dotenv";
import usuarioRouter from "../routes/usuarioRouter"; // suas rotas principais

// Carrega variáveis do .env
config();

const app = express();
const PORT = process.env.PORT || 3000;

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
