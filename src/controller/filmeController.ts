import { Request, Response } from "express";
import axios from "axios";

// ⚙️ Configure sua API KEY aqui ou no .env
const TMDB_API_KEY = process.env.TMDB_API_KEY || "SUA_CHAVE_AQUI";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * GET /api/filmes/populares
 */
export const getFilmesPopulares = async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });
    res.json(data.results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar filmes populares" });
  }
};

/**
 * GET /api/filmes/:id/recomendacoes
 */
export const getRecomendacoes = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/${id}/recommendations`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });
    res.json(data.results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar recomendações" });
  }
};
