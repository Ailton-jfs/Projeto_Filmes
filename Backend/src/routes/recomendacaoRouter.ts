import { Router } from "express";
import axios from "axios";
import { openai } from "../utils/chatgptClient";
import { config } from "dotenv";

config();
const router = Router();

// Base da API do TMDb
const TMDB_API_KEY = process.env.TMDB_API_KEY || "SUA_CHAVE_TMDB_AQUI";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

router.get("/", async (req, res) => {
  const { preferencias } = req.query;

  if (!preferencias) {
    return res.status(400).json({ erro: "Informe suas preferências de filmes." });
  }

  try {
    // 1️⃣ Gera lista de filmes sugeridos com ChatGPT
    const prompt = `
      Sou um especialista em cinema. Baseado nas preferências "${preferencias}",
      recomende 5 filmes populares que combinam com esse gosto.
      Retorne apenas um JSON puro, no formato:
      [
        {"titulo": "nome do filme"},
        {"titulo": "nome do filme"},
        ...
      ]
    `;

    const resposta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const texto = resposta.choices[0]?.message?.content || "[]";
    const listaChatGPT = JSON.parse(texto);

    // 2️⃣ Busca informações reais no TMDb
    const resultadosDetalhados = [];

    for (const item of listaChatGPT) {
      try {
        const busca = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            query: item.titulo,
            language: "pt-BR",
          },
        });

        const filme = busca.data.results[0];
        if (filme) {
          resultadosDetalhados.push({
            titulo: filme.title,
            descricao: filme.overview,
            poster: `https://image.tmdb.org/t/p/w500${filme.poster_path}`,
            nota: filme.vote_average,
            ano: filme.release_date?.split("-")[0],
          });
        }
      } catch (erro) {
        console.warn(`❌ Erro ao buscar ${item.titulo} no TMDb`);
      }
    }

    // 3️⃣ Retorna os filmes encontrados
    res.json(resultadosDetalhados);
  } catch (erro) {
    console.error("Erro ao gerar recomendações:", erro);
    res.status(500).json({ erro: "Falha ao gerar recomendações." });
  }
});

export default router;
