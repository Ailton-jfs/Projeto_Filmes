// src/index.ts
import express from "express";
import type { Request, Response } from "express";
import axios from "axios";
import { Router } from "express";
import filmeRouter from "./filmeRouter";
import usuarioRouter from "./usuarioRouter";

const app = express();
const PORT = 3000;
const router = Router();

// Chave da API do TMDb (crie uma conta gratuita em themoviedb.org)
const TMDB_API_KEY = "SUA_CHAVE_AQUI";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Rota básica
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API de Recomendação de Filmes 🎬" });
});

// Rota: buscar filmes populares
app.get("/filmes/populares", async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });
    res.json(data.results);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar filmes populares" });
  }
});

// Rota: recomendações com base em um filme
app.get("/filmes/:id/recomendacoes", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/${id}/recommendations`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });
    res.json(data.results);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar recomendações" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

router.use("/filmes", filmeRouter);
router.use("/usuarios", usuarioRouter); // já existente

export default router;
