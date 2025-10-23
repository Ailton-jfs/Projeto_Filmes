import fs from "fs";
import path from "path";

export interface Recomendacao {
  movieId: number;
  title: string;
  score: number;
}

const DATA_PATH = path.join(__dirname, "recommendations.json");

let recommendations: Record<string, Recomendacao[]> = {};

export function loadRecommendations(): void {
  try {
    const data = fs.readFileSync(DATA_PATH, "utf-8");
    recommendations = JSON.parse(data);
    console.log(`✅ ${Object.keys(recommendations).length} filmes carregados.`);
  } catch (err) {
    console.error("Erro ao carregar recommendations.json:", err);
  }
}

export function getRecommendations(movieId: number, limit = 10): Recomendacao[] {
  const recs = recommendations[movieId];
  return recs ? recs.slice(0, limit) : [];
}
