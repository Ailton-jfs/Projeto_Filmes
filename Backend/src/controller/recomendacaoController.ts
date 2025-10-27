import { Request, Response } from "express";
import { openai } from "../utils/chatgptClient";

export const recomendarFilmes = async (req: Request, res: Response) => {
  try {
    const { nome, preferencias } = req.body;

    const prompt = `
      O usuário se chama ${nome}.
      Ele gosta de filmes com os seguintes temas: ${preferencias}.
      Sugira 5 filmes que ele provavelmente vai gostar.
      Liste em formato JSON com: titulo, genero e breve_descricao.
    `;

    const resposta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const texto = resposta.choices?.[0]?.message?.content ?? "Não foi possível gerar recomendações.";
    res.json({ recomendacoes: texto });
  } catch (error) {
    console.error("Erro ao gerar recomendação:", error);
    res.status(500).json({ error: "Falha ao gerar recomendação" });
  }
};
