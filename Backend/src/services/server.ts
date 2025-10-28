import express from "express";
import cors from "cors";
import { config } from "dotenv";
import router from "../routes/api"; // suas rotas principais

// Carrega variáveis do .env
config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Corrige o erro de CORS — permite acesso do Live Server
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"], // libera o Live Server
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

// Middleware para tratar JSON
app.use(express.json());

// ✅ Rotas principais (prefixadas com /api)
app.use("/api", router);

// ✅ Servir arquivos HTML, CSS e JS (caso use a pasta public)
app.use(express.static("public"));

// ✅ Teste de rota simples (para confirmar que está rodando)
app.get("/", (req, res) => {
  res.send("API funcionando! 🚀");
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
