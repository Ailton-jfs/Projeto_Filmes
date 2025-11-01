import { Router } from "express";
import axios from "axios";
import OpenAI from "openai";
import { spawn } from "child_process";

const router = Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Função auxiliar para buscar o link de streaming no TMDB (Esta função é usada pelas 3 rotas)
async function getStreamingLinks(movieTitle: string): Promise<any[]> {
    const defaultResponse: any[] = [];

    try {
        // 1. Buscar o ID do filme pelo nome
        const searchRes = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: { 
                api_key: TMDB_API_KEY, 
                query: movieTitle, 
                language: "pt-BR" 
            },
        });
        
        const movieId: number | undefined = searchRes.data.results[0]?.id;
        if (!movieId) return defaultResponse;

        // 2. Buscar os provedores de onde assistir (Watch Providers)
        const providersRes = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers`, {
            params: { api_key: TMDB_API_KEY },
        });

        const providers = providersRes.data.results['BR'];
        if (!providers) return defaultResponse;

        const links: any[] = [];
        
        // Adicionar links de assinatura (Subscription - Assinatura)
        if (providers.flatrate) {
            providers.flatrate.forEach((p: any) => {
                links.push({
                    plataforma: p.provider_name,
                    url: providers.link, 
                });
            });
        }
        
        // Adicionar link de aluguel/compra (Rent/Buy) - Se houver
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
// ROTAS DO TMDB (COM BUSCA DE LINKS)
// ------------------------------------------------------------------

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

    let filmes: any[] = data.results.slice(0, 5).map((filme: any) => ({
      id: filme.id,
      title: filme.title,
      overview: filme.overview,
      poster_path: filme.poster_path,
    }));

    // 🚀 PROCESSAMENTO DE LINKS: Exatamente como na IA
    const filmesComLinksPromises = filmes.map(async (filme: any) => {
        if (filme.title) {
            filme.links = await getStreamingLinks(filme.title);
        } else {
            filme.links = [];
        }
        return filme;
    });

    const filmesComLinks = await Promise.all(filmesComLinksPromises);
    // -------------------

    res.json(filmesComLinks); 
  } catch (error) {
    console.error("❌ Erro ao buscar filmes do TMDB:", error);
    res.status(500).json({ erro: "Erro ao buscar filmes do TMDB" });
  }
});

// 🔹 2. TMDB original
router.get("/api/tmdb", async (req, res) => {
  try {
    const { generos, busca } = req.query; 
    
    // DECISÃO: USAR BUSCA OU DISCOVER
    const endpoint = busca ? "/search/movie" : "/discover/movie";
    const params: any = {
        api_key: TMDB_API_KEY,
        language: "pt-BR",
    };
    if (busca) {
        params.query = busca;
    } else {
        params.with_genres = generos || "";
    }

    const { data } = await axios.get(`${TMDB_BASE_URL}${endpoint}`, { params });

    let filmes: any[] = data.results;
    
    // 🚀 PROCESSAMENTO DE LINKS: Exatamente como na IA
    const filmesComLinksPromises = filmes.map(async (filme: any) => {
        const title = filme.title || filme.name; // Usa nome para séries, se necessário
        if (title) {
            filme.links = await getStreamingLinks(title);
        } else {
             filme.links = [];
        }
        return filme;
    });

    const filmesComLinks = await Promise.all(filmesComLinksPromises);
    // -------------------

    res.json(filmesComLinks); 
  } catch (error) {
    console.error("❌ ERRO FATAL NA ROTA /api/tmdb:", error);
    res.status(500).json({ erro: "Erro ao buscar filmes do TMDB" });
  }
});

// ------------------------------------------------------------------
// ROTA DA IA (MANTIDA)
// ------------------------------------------------------------------

// 🔹 3. ChatGPT ajustado para texto livre e links de plataformas (COM INTEGRAÇÃO TMDB PARA LINKS)
router.post("/api/chat", async (req, res) => {
  try {
    const { preferencias, nome } = req.body;

    if (!preferencias || !nome) {
      return res.status(400).json({ erro: "Campos obrigatórios ausentes." });
    }

    // PROMPT: A IA SÓ DEVE FORNECER OS TÍTULOS E DESCRIÇÕES.
    const prompt = `
      O usuário ${nome} gosta dos seguintes tipos de filmes: ${preferencias}.
      Sugira **estritamente 3 filmes populares e interessantes** para ele.
      **NÃO INCLUA NENHUM LINK DE STREAMING**.
      Retorne a resposta estritamente em JSON, com o formato:
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

    // 🔹 Remove blocos Markdown ```json ou ```
    content = content.replace(/```json|```/g, "").trim();

    let recomendacoes: any[] = []; 
    try {
      recomendacoes = JSON.parse(content);
    } catch {
      recomendacoes = [{ titulo: "Erro ao interpretar resposta", descricao: content, links: [] }];
    }

    // 🚀 BUSCA DE LINKS ATUAIS VIA TMDB
    const promises = recomendacoes.map(async (filme: any) => {
        if (filme.titulo) {
            filme.links = await getStreamingLinks(filme.titulo);
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
// OUTRAS ROTAS (MANTIDAS)
// ------------------------------------------------------------------

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

// Garante que a exportação está no formato correto (ES Module)
export default router;