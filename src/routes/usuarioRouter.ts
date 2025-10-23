// src/routes/usuarioRouter.ts
import { Router, Request, Response } from "express";

const router = Router();

// Lista todos os usuários (exemplo)
router.get("/", (req: Request, res: Response) => {
  res.json([
    { id: 1, nome: "Ailton", email: "ailton@example.com" },
    { id: 2, nome: "Maria", email: "maria@example.com" },
  ]);
});

// Busca usuário por ID
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ id, nome: "Usuário Exemplo", email: "exemplo@example.com" });
});

// Cria um novo usuário (exemplo)
router.post("/", (req: Request, res: Response) => {
  res.status(201).json({ message: "Usuário criado com sucesso!" });
});

export default router;
