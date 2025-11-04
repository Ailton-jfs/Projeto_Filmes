import { Router } from "express";
import axios from "axios";
import OpenAI from "openai";
import { spawn } from "child_process";

const router = Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ------------------------------------------------------------------
// 🔧 Função auxiliar para buscar links de streaming (TMDB)
// ------------------------------------------------------------------
async function getStreamingLinks(movieTitle: string): Promise<any[]> {
  const defaultResponse: any[] = [];

  try {
    // 1️⃣ Busca o ID do filme
    const searchRes = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: { 
        api_key: TMDB_API_KEY, 
        query: movieTitle, 
        language: "pt-BR" 
      },
    });

    const movieId: number | undefined = searchRes.data.results[0]?.id;
    if (!movieId) return defaultResponse;

    // 2️⃣ Busca provedores (onde assistir)
    const providersRes = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers`, {
      params: { api_key: TMDB_API_KEY },
    });

    const providers = providersRes.data.results["BR"];
    if (!providers) return defaultResponse;

    const links: any[] = [];

    if (providers.flatrate) {
      providers.flatrate.forEach((p: any) => {
        links.push({
          plataforma: p.provider_name,
          url: providers.link,
        });
      });
    }

    if (providers.rent || providers.buy) {
      links.push({
        plataforma: "Aluguel/Compra",
        url: providers.link,
      });
    }

    return links;
  } catch (error) {
    console.error(`Erro ao buscar links de streaming para ${movieTitle}:`, error);
    return defaultResponse;
  }
}

// ------------------------------------------------------------------
// 🔹 1. Filmes do TMDB (com links)
// ------------------------------------------------------------------
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

    let filmes: any[] = data.results.slice(0, 5).map((filme: any) => ({
      id: filme.id,
      title: filme.title,
      overview: filme.overview,
      poster_path: filme.poster_path,
    }));

    const filmesComLinksPromises = filmes.map(async (filme: any) => {
      filme.links = await getStreamingLinks(filme.title);
      return filme;
    });

    const filmesComLinks = await Promise.all(filmesComLinksPromises);

    res.json(filmesComLinks);
  } catch (error) {
    console.error("❌ Erro ao buscar filmes do TMDB:", error);
    res.status(500).json({ erro: "Erro ao buscar filmes do TMDB" });
  }
});

// ------------------------------------------------------------------
// 🔹 2. Rota TMDB original (busca ou discover)
// ------------------------------------------------------------------
router.get("/api/tmdb", async (req, res) => {
  try {
    const { generos, busca } = req.query;
    const endpoint = busca ? "/search/movie" : "/discover/movie";

    const params: any = {
      api_key: TMDB_API_KEY,
      language: "pt-BR",
    };
    if (busca) params.query = busca;
    else params.with_genres = generos || "";

    const { data } = await axios.get(`${TMDB_BASE_URL}${endpoint}`, { params });

    const filmesComLinks = await Promise.all(
      data.results.map(async (filme: any) => {
        const title = filme.title || filme.name;
        filme.links = await getStreamingLinks(title);
        return filme;
      })
    );

    res.json(filmesComLinks);
  } catch (error) {
    console.error("❌ ERRO FATAL NA ROTA /api/tmdb:", error);
    res.status(500).json({ erro: "Erro ao buscar filmes do TMDB" });
  }
});

// ------------------------------------------------------------------
// 🔹 3. Rota da IA — usa preferências livres do usuário
// ------------------------------------------------------------------
router.post("/api/chat", async (req, res) => {
  try {
    const { preferencias, nome } = req.body;

    if (!preferencias || !nome) {
      return res.status(400).json({ erro: "Campos obrigatórios ausentes." });
    }

    const prompt = `
      O usuário ${nome} gosta dos seguintes tipos de filmes: ${preferencias}.
      Sugira **3 filmes populares e interessantes** para ele.
      **NÃO inclua links de streaming.**
      Retorne estritamente em JSON:
      [
        {
          "titulo": "Nome do Filme",
          "descricao": "Resumo curto explicando por que ele iria gostar",
          "links": []
        }
      ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    let content = completion?.choices?.[0]?.message?.content?.trim() || "[]";
    content = content.replace(/```json|```/g, "").trim();

    let recomendacoes: any[] = [];
    try {
      recomendacoes = JSON.parse(content);
    } catch {
      recomendacoes = [{ titulo: "Erro ao interpretar resposta", descricao: content, links: [] }];
    }

    // 🚀 Busca de links + pôster via TMDB
    const promises = recomendacoes.map(async (filme: any) => {
      if (filme.titulo) {
        filme.links = await getStreamingLinks(filme.titulo);

        try {
          const searchRes = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: { api_key: TMDB_API_KEY, query: filme.titulo, language: "pt-BR" },
          });

          const posterPath = searchRes.data.results[0]?.poster_path || null;
          filme.poster_url = posterPath
            ? `https://image.tmdb.org/t/p/w500${posterPath}`
            : null;
        } catch (err) {
          console.warn(`⚠️ Erro ao buscar banner para ${filme.titulo}`);
          filme.poster_url = null;
        }
      }
      return filme;
    });

    const recomendacoesComLinks = await Promise.all(promises);

    res.json({ recomendacoes: recomendacoesComLinks });
  } catch (err: any) {
    console.error("❌ Erro no ChatGPT:", err.message);
    res.status(500).json({ erro: "Falha ao gerar recomendações com a IA." });
  }
});

// ------------------------------------------------------------------
// 🔹 4. Outras rotas (populares e recomendação via Python)
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
export default router;
