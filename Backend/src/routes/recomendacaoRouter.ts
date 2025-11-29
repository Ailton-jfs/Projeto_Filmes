import { Router } from "express";
import axios from "axios";
import { openai } from "../utils/chatgptClient";
import { config } from "dotenv";

config();
const router = Router();

// 🔹 Base da API do TMDB
// Se o valor estiver faltando no .env, usará a string 'FALHOU_LEITURA'
const TMDB_API_KEY = process.env.TMDB_API_KEY || "FALHOU_LEITURA"; 
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// 🔹 Detecta se é filme, série ou desenho a partir da preferência
function detectarTipo(preferencias: string): "movie" | "tv" {
  const texto = preferencias.toLowerCase();
  if (texto.includes("série") || texto.includes("serie") || texto.includes("tv")) return "tv";
  if (texto.includes("desenho") || texto.includes("animação") || texto.includes("animacao")) return "tv";
  return "movie";
}

router.post("/", async (req, res) => {
    console.log("--- INÍCIO DA RECOMENDAÇÃO ---");
    const { preferencias } = req.body;

    if (!preferencias) {
        return res.status(400).json({ erro: "Informe suas preferências de filmes, séries ou desenhos." });
    }

    if (TMDB_API_KEY === "FALHOU_LEITURA") {
        console.error("❌ ERRO: TMDB_API_KEY não foi lida do arquivo .env.");
        return res.status(500).json({ erro: "Chave TMDB API ausente no servidor." });
    }

    const tipo = detectarTipo(preferencias);
    console.log("Tipo detectado:", tipo);

    try {
        // 1️⃣ Prompt otimizado para o GPT gerar apenas JSON puro
        const prompt = `
          Você é um curador de cinema e TV.
          Baseado nas preferências: "${preferencias}",
          recomende 5 títulos populares que combinem com esse gosto.

          Responda SOMENTE com um JSON válido no formato:
          [
            {"titulo": "nome do título"},
            {"titulo": "nome do título"},
            {"titulo": "nome do título"},
            {"titulo": "nome do título"},
            {"titulo": "nome do título"}
          ]

          Não adicione comentários, texto fora do JSON, nem markdown.
        `;

        // 2️⃣ Consulta ao modelo GPT
        console.log("Chamando OpenAI...");
        const resposta = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });
        console.log("Resposta da OpenAI recebida.");

        const texto = resposta.choices?.[0]?.message?.content || "[]";
        console.log("🧠 Resposta bruta do GPT:", texto);

        // 🧹 Limpeza de possíveis blocos de markdown
        const textoLimpo = texto
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        let listaChatGPT: any[] = [];
        try {
          listaChatGPT = JSON.parse(textoLimpo);
        } catch (erro) {
          console.warn("⚠️ Erro ao converter resposta do GPT em JSON:", textoLimpo);
          return res.status(500).json({ erro: "Erro ao processar resposta do ChatGPT." });
        }

        // 3️⃣ Busca detalhes reais no TMDB
        const resultadosDetalhados = [];
        console.log("Iniciando busca no TMDB...");

        for (const item of listaChatGPT) {
          try {
            console.log(`Buscando: ${item.titulo}`);
            const busca = await axios.get(`${TMDB_BASE_URL}/search/${tipo}`, {
              params: {
                api_key: TMDB_API_KEY,
                query: item.titulo,
                language: "pt-BR",
              },
            });

            const resultado = busca.data.results?.[0];
            if (resultado) {
              resultadosDetalhados.push({
                id: resultado.id,
                titulo: resultado.title || resultado.name,
                descricao: resultado.overview,
                poster: resultado.poster_path
                  ? `https://image.tmdb.org/t/p/w500${resultado.poster_path}`
                  : null,
                nota: resultado.vote_average,
                ano:
                  resultado.release_date?.split("-")[0] ||
                  resultado.first_air_date?.split("-")[0] ||
                  "Desconhecido",
                tipo: tipo === "movie" ? "Filme" : "Série/Desenho",
                link_tmdb: `https://www.themoviedb.org/${tipo}/${resultado.id}`,
              });
            }
          } catch (err) {
            // Log mais específico para identificar o erro do Axios (TMDB)
            console.warn(`❌ Erro ao buscar "${item.titulo}" no TMDb:`, (err as any).message);
          }
        }

        // 4️⃣ Retorna os resultados ao cliente
        res.json(resultadosDetalhados);
    } catch (erro) {
        // Se cair aqui, o erro é na chamada da OpenAI ou em algo mais grave.
        console.error("❌ ERRO FATAL AO GERAR RECOMENDAÇÕES:", erro); 
        res.status(500).json({ erro: "Falha interna ao gerar recomendações." });
    }
});

export default router;