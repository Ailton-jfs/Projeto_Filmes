import { Router } from "express";
import axios from "axios";
import filmeRouter from "./filmesRouter";
import usuarioRouter from "./usuarioRouter";
import recomendacaoRouter from "./recomendacaoRouter";
import adminRouter from "./adminRouter";

const router = Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";


// Filmes populares
router.get("/populares", async (req, res) => {
  try {
    const resposta = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" }
    });
    res.json(resposta.data.results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível buscar filmes populares." });
  }
});

// Recomendações por ID
router.get("/recomendacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resposta = await axios.get(`${TMDB_BASE_URL}/movie/${id}/recommendations`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" }
    });
    res.json(resposta.data.results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível buscar recomendações." });
  }
});

// Rotas modulares
router.use("/filmes", filmeRouter);
router.use("/usuarios", usuarioRouter);
router.use("/recomendacoes", recomendacaoRouter);
router.use("/admin", adminRouter); 

export default router;
