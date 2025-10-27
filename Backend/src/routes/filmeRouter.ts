import { Router } from "express";
import axios from "axios";
import { spawn } from "child_process";

const router = Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Filmes populares
router.get("/populares", async (req, res) => {
  try {
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });
    res.json(data.results);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar filmes populares" });
  }
});

// Recomendação personalizada (Python)
router.get("/recomendar", async (req, res) => {
  const { email } = req.query;

  if (!email) return res.status(400).json({ erro: "Email não informado." });

  // Chama o script Python
  const python = spawn("python", ["./ml/train.py", String(email)]);

  let dados = "";
  python.stdout.on("data", (data) => {
    dados += data.toString();
  });

  python.on("close", () => {
    try {
      const recomendacoes = JSON.parse(dados);
      res.json(recomendacoes);
    } catch (err) {
      res.status(500).json({ erro: "Erro ao processar recomendação" });
    }
  });
});

export default router;
