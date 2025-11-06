import { Router } from "express";
import axios from "axios";
import OpenAI from "openai";
import { spawn } from "child_process";

const router = Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🔑 NOVO TIPO DE RETORNO (Para incluir os dados do pôster)
type MovieData = {
    links: any[];
    poster_path: string | null;
    poster_url: string | null;
};

// ------------------------------------------------------------------
// 🔧 Função auxiliar: AGORA CHAMA getMovieDataAndLinks (Pega pôster e links)
// ------------------------------------------------------------------
async function getMovieDataAndLinks(movieTitle: string): Promise<MovieData> {
  const defaultResponse: MovieData = { links: [], poster_path: null, poster_url: null };

  try {
    // 1️⃣ Busca o ID do filme, POSTER e o Path
    const searchRes = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: { 
        api_key: TMDB_API_KEY, 
        query: movieTitle, 
        language: "pt-BR" 
      },
    });

    const firstResult = searchRes.data.results[0];
    const movieId: number | undefined = firstResult?.id;
    const posterPath: string | null = firstResult?.poster_path || null;
    const posterUrl: string | null = posterPath 
        ? `https://image.tmdb.org/t/p/w500${posterPath}` 
        : null;

    // Retorna os dados do poster, mesmo que não encontre o ID para links
    if (!movieId) return { links: defaultResponse.links, poster_path: posterPath, poster_url: posterUrl };

    // 2️⃣ Busca provedores (onde assistir)
    const providersRes = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers`, {
      params: { api_key: TMDB_API_KEY },
    });

    const providers = providersRes.data.results["BR"];
    if (!providers) return { links: defaultResponse.links, poster_path: posterPath, poster_url: posterUrl };

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

    return { links, poster_path: posterPath, poster_url: posterUrl };
  } catch (error) {
    console.error(`Erro ao buscar dados do TMDB para ${movieTitle}:`, error);
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
      // 🔑 CHAMA A NOVA FUNÇÃO
      const tmdbData = await getMovieDataAndLinks(filme.title);
      filme.links = tmdbData.links;
      filme.poster_path = filme.poster_path || tmdbData.poster_path; // Prioriza o poster do discover
      filme.poster_url = tmdbData.poster_url;
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
        // 🔑 CHAMA A NOVA FUNÇÃO
        const tmdbData = await getMovieDataAndLinks(title);
        filme.links = tmdbData.links;
        filme.poster_path = filme.poster_path || tmdbData.poster_path; // Prioriza o poster do discover
        filme.poster_url = tmdbData.poster_url;
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
// 🔹 3. Rota da IA — usa preferências livres do usuário (CORRIGIDA)
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
        // 🔑 Usa a nova função unificada e elimina a busca de pôster duplicada
        const tmdbData = await getMovieDataAndLinks(filme.titulo);
        filme.links = tmdbData.links;
        filme.poster_path = tmdbData.poster_path;
        filme.poster_url = tmdbData.poster_url;
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

// 🔑 Rota de ML: AGORA BUSCA POSTER E LINKS
router.get("/api/filmes/recomendar", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ erro: "Email não informado." });

  // Ajuste o nome do arquivo se for 'train_model.py'
  const python = spawn("python", ["./ml/train_model.py", String(email)]); 
  let dados = "";
  python.stdout.on("data", (data) => (dados += data.toString()));

  // 🔑 Torna a função de 'close' assíncrona para usar await
  python.on("close", async () => { 
    try {
      // 1. Recebe a lista de filmes do Python (apenas título/voto)
      const recomendacoesPyt: any[] = JSON.parse(dados);

      // 2. Enriquecimento dos dados com TMDB
      const promises = recomendacoesPyt.map(async (filme: any) => {
        // Assumimos que o Python retorna a chave 'title'
        if (filme.title) { 
          const tmdbData = await getMovieDataAndLinks(filme.title);
          
          // Anexa os dados do TMDB
          filme.links = tmdbData.links;
          filme.poster_path = tmdbData.poster_path;
          filme.poster_url = tmdbData.poster_url;
        }
        return filme;
      });

      // 3. Espera todas as buscas do TMDB terminarem
      const recomendacoesComLinks = await Promise.all(promises);

      res.json(recomendacoesComLinks);
    } catch (err) {
      console.error("❌ Erro ao processar recomendação do ML:", err);
      res.status(500).json({ erro: "Erro ao processar recomendação do ML" });
    }
  });
});

// ------------------------------------------------------------------
export default router;