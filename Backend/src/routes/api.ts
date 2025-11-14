import { Router } from "express";
import axios from "axios";
import { config } from "dotenv";
import filmeRouter from "./filmesRouter";
import usuarioRouter from "./usuarioRouter";
import recomendacaoRouter from "./recomendacaoRouter";

config(); // carrega variáveis do .env

const router = Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// 🏠 Rota inicial para verificar se o servidor está ativo
router.get("/", (req, res) => {
  res.json({ message: "🎬 API de Recomendação de Filmes está online!" });
});

// 🎥 Rota direta: filmes populares do TMDB
router.get("/populares", async (req, res) => {
  try {
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });
    res.json(data.results);
  } catch (error) {
    console.error("❌ Erro ao buscar filmes populares:", error);
    res.status(500).json({ erro: "Erro ao buscar filmes populares" });
  }
});

// 🎞️ Rota direta: recomendações baseadas em um ID de filme
router.get("/recomendacoes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/${id}/recommendations`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });
    res.json(data.results);
  } catch (error) {
    console.error("❌ Erro ao buscar recomendações:", error);
    res.status(500).json({ erro: "Erro ao buscar recomendações" });
  }
});

// ✅ Importa as rotas modulares
router.use("/filmes", filmeRouter);           // TMDB + IA
router.use("/usuarios", usuarioRouter);       // Banco de dados
router.use("/recomendacoes", recomendacaoRouter); // IA personalizada

export default router;
