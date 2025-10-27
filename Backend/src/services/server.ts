import express from "express";
import cors from "cors";
import { config } from "dotenv";
import router from "../routes/api"; // rotas principais

// Carrega variáveis do .env
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas principais (prefixadas com /api)
app.use("/api", router);

// Servir HTML e CSS (se estiver na pasta public)
app.use(express.static("public"));

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

