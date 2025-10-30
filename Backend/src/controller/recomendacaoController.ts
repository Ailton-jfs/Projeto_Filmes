import { Request, Response } from "express";
import { openai } from "../utils/chatgptClient";

export const recomendarFilmes = async (req: Request, res: Response) => {
  try {
    const { email, preferencias } = req.query;

    if (!preferencias) {
      return res.status(400).json({ erro: "Preferências não fornecidas." });
    }

    console.log(`🎯 Gerando recomendações para ${email}...`);

    // Chamada ao modelo GPT
    const prompt = `
      Com base nas preferências de filmes "${preferencias}",
      sugira 5 filmes populares que combinem com o gosto do usuário.
      Responda no formato JSON, com este formato:
      [
        { "title": "Nome do filme", "descricao": "breve descrição", "poster_path": "/exemplo.jpg" }
      ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // rápido e barato
      messages: [{ role: "user", content: prompt }],
    });

    // Protege contra estruturas inesperadas/ nulas retornadas pela API
    const resposta: string = completion?.choices?.[0]?.message?.content ?? "";

    // Tenta transformar a resposta do GPT em JSON
    let filmes = [];
    try {
      filmes = JSON.parse(resposta || "[]");
    } catch {
      console.warn("Resposta não estava em JSON válido. Texto retornado:", resposta);
      filmes = [];
    }

    res.json(filmes);
  } catch (erro) {
    console.error("Erro ao gerar recomendações:", erro);
    res.status(500).json({ erro: "Falha ao gerar recomendações de filmes." });
  }
};
