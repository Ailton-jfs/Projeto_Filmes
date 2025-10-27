import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";

// Caminho absoluto do .env na raiz do projeto
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Verifica se a variável existe
if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ OPENAI_API_KEY não encontrada no .env");
}

// Cria o cliente OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
