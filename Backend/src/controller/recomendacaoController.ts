import axios from "axios";
import { openai } from "../utils/chatgptClient";

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const gerarRecomendacoes = async (preferencias: string) => {
  // Prompt para garantir JSON limpo
  const prompt = `
    Você é um especialista em cinema, séries e animações.
    Com base nas preferências: "${preferencias}",
    recomende 6 títulos variados (filmes, séries ou desenhos).

    Responda SOMENTE com JSON puro no formato:

    [
      {"titulo": "nome"},
      {"titulo": "nome"},
      {"titulo": "nome"},
      {"titulo": "nome"},
      {"titulo": "nome"},
      {"titulo": "nome"}
    ]
  `;

  // 🔹 GPT
  const respostaGPT = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const texto = respostaGPT.choices?.[0]?.message?.content ?? "[]";


  // Limpa possíveis marcas de código
  const textoLimpo = texto
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let lista: any[] = [];

  try {
    lista = JSON.parse(textoLimpo);
  } catch {
    throw new Error("GPT retornou JSON inválido");
  }

  // 🔹 Busca no TMDB
  const resultados: any[] = [];

  for (const item of lista) {
    try {
      const busca = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
        params: {
          api_key: TMDB_API_KEY,
          query: item.titulo,
          language: "pt-BR",
        },
      });

      const encontrado = busca.data.results[0];
      if (!encontrado) continue;

      const tipo =
        encontrado.media_type === "movie"
          ? "movie"
          : encontrado.media_type === "tv"
          ? "tv"
          : "movie";

      resultados.push({
        titulo: tipo === "movie" ? encontrado.title : encontrado.name,
        descricao: encontrado.overview,
        poster: encontrado.poster_path
          ? `https://image.tmdb.org/t/p/w500${encontrado.poster_path}`
          : null,
        nota: encontrado.vote_average,
        ano:
          (tipo === "movie"
            ? encontrado.release_date
            : encontrado.first_air_date
          )?.split("-")[0] || "",
        link_tmdb: `https://www.themoviedb.org/${tipo}/${encontrado.id}`,
        tipo,
      });
    } catch {
      continue;
    }
  }

  return resultados;
};
