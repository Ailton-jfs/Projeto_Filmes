import { Router } from "express";
import axios from "axios";
import { openai } from "../utils/chatgptClient";
import { config } from "dotenv";

config();
const router = Router();

// Base da API do TMDb
const TMDB_API_KEY = process.env.TMDB_API_KEY || "SUA_CHAVE_TMDB_AQUI";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

router.post("/", async (req, res) => {
  const { preferencias } = req.body;

  if (!preferencias) {
    return res.status(400).json({ erro: "Informe suas preferências de filmes." });
  }

  try {
    // 1️⃣ Prompt melhorado para o GPT responder apenas JSON puro
    const prompt = `
      Você é um especialista em cinema.
      Baseado nas preferências: "${preferencias}",
      recomende 5 filmes populares que combinem com esse gosto.
      
      Responda SOMENTE com um JSON válido no formato:
      [
        {"titulo": "nome do filme"},
        {"titulo": "nome do filme"},
        {"titulo": "nome do filme"},
        {"titulo": "nome do filme"},
        {"titulo": "nome do filme"}
      ]

      Não adicione comentários, texto fora do JSON, nem blocos de markdown.
    `;

    // 🔹 Chamada ao modelo GPT
    const resposta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const texto = resposta.choices?.[0]?.message?.content || "[]";
    console.log("🧠 Resposta bruta do GPT:", texto);

    // 🧹 Remove blocos de markdown e espaços extras
    const textoLimpo = texto
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let listaChatGPT: any[] = [];
    try {
      listaChatGPT = JSON.parse(textoLimpo);
    } catch (erro) {
      console.warn("⚠️ Erro ao converter resposta do GPT em JSON. Conteúdo retornado:", textoLimpo);
      return res.status(500).json({ erro: "Erro ao processar a resposta do ChatGPT." });
    }

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
            poster: filme.poster_path
              ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
              : null,
            nota: filme.vote_average,
            ano: filme.release_date?.split("-")[0],
          });
        }
      } catch {
        console.warn(`❌ Erro ao buscar "${item.titulo}" no TMDb`);
      }
    }

    // 3️⃣ Retorna os filmes encontrados
    res.json(resultadosDetalhados);
  } catch (erro) {
    console.error("❌ Erro ao gerar recomendações:", erro);
    res.status(500).json({ erro: "Falha ao gerar recomendações." });
  }
});

export default router;
