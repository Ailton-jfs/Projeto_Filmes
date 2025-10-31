import { Router } from "express";
import axios from "axios";
import OpenAI from "openai";
import { spawn } from "child_process";

const router = Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🔹 1. Filmes do TMDB (em vez de locais)
router.get("/filmes", async (req, res) => {
  try {
    const { generos } = req.query; 
    const { data } = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "pt-BR",
        sort_by: "popularity.desc",
        with_genres: generos || "",
      },
    });

    const filmes = data.results.slice(0, 5).map((filme: any) => ({
      id: filme.id,
      title: filme.title,
      overview: filme.overview,
      poster_path: filme.poster_path,
    }));

    res.json(filmes);
  } catch (error) {
    console.error("❌ Erro ao buscar filmes do TMDB:", error);
    res.status(500).json({ erro: "Erro ao buscar filmes do TMDB" });
  }
});

// 🔹 2. TMDB original
router.get("/api/tmdb", async (req, res) => {
  try {
    const { generos } = req.query;
    const { data } = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "pt-BR",
        with_genres: generos || ""
      }
    });
    res.json(data.results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar filmes do TMDB" });
  }
});
// 🔹 3. ChatGPT ajustado para texto livre e links de plataformas
router.post("/api/chat", async (req, res) => {
  try {
    const { preferencias, nome } = req.body;

    if (!preferencias || !nome) {
      return res.status(400).json({ erro: "Campos obrigatórios ausentes." });
    }

    const prompt = `
      O usuário ${nome} gosta dos seguintes tipos de filmes: ${preferencias}.
      Sugira 3 filmes populares e interessantes para ele.
      Para cada filme, inclua links de plataformas digitais (Netflix, Prime Video, Disney+, etc.) se possível.
      Retorne a resposta estritamente em JSON, com o formato:
      [
        {
          "titulo": "Nome do Filme",
          "descricao": "Resumo curto explicando por que ele iria gostar",
          "links": [
            {"plataforma": "Netflix", "url": "https://..."},
            {"plataforma": "Prime Video", "url": "https://..."}
          ]
        }
      ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    let content = completion?.choices?.[0]?.message?.content?.trim() || "[]";

    // 🔹 Remove blocos Markdown ```json ou ```
    content = content.replace(/```json|```/g, "").trim();

    let recomendacoes = [];
    try {
      recomendacoes = JSON.parse(content);
    } catch {
      recomendacoes = [{ titulo: "Erro ao interpretar resposta", descricao: content, links: [] }];
    }

    res.json({ recomendacoes });
  } catch (err: any) {
    console.error("❌ Erro no ChatGPT:", err.message);
    res.status(500).json({ erro: "Falha ao gerar recomendações com a IA." });
  }
});

// 🔹 4. Outras rotas
router.get("/api/filmes/populares", async (req, res) => {
  try {
    const { data } = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });
    res.json(data.results);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar filmes populares" });
  }
});

router.get("/api/filmes/recomendar", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ erro: "Email não informado." });

  const python = spawn("python", ["./ml/train.py", String(email)]);
  let dados = "";
  python.stdout.on("data", (data) => (dados += data.toString()));

  python.on("close", () => {
    try {
      const recomendacoes = JSON.parse(dados);
      res.json(recomendacoes);
    } catch {
      res.status(500).json({ erro: "Erro ao processar recomendação" });
    }
  });
});

export default router;
