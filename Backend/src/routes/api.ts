// src/routes/api.ts
import { Router } from "express";
import axios from "axios";
import filmeRouter from "./filmesRouter";
import usuarioRouter from "./usuarioRouter";
import recomendacaoRouter from "./recomendacaoRouter";

const router = Router();

// 🔑 Sua chave da API do TMDb
import { config } from "dotenv";
config(); // carrega as variáveis do .env

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";


// 🏠 Rota básica
router.get("/", (req, res) => {
  res.json({ message: "API de Recomendação de Filmes 🎬" });
});

// 🎥 Rota: buscar filmes populares
router.get("/filmes/populares", async (req, res) => {
  try {
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });
    res.json(data.results);
  } catch (error) {
    console.error("Erro ao buscar filmes populares:", error);
    res.status(500).json({ error: "Erro ao buscar filmes populares" });
  }
});

// 🎞️ Rota: recomendações com base em um filme
router.get("/filmes/:id/recomendacoes", async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/${id}/recommendations`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });
    res.json(data.results);
  } catch (error) {
    console.error("Erro ao buscar recomendações:", error);
    res.status(500).json({ error: "Erro ao buscar recomendações" });
  }
});

// ✅ Integra suas rotas secundárias
router.use("/filmes", filmeRouter);
router.use("/usuarios", usuarioRouter);
router.use("/recomendacao", recomendacaoRouter);

export default router;
