import { Router } from "express";

const router = Router();

// Simples "banco" temporário
const usuarios: any[] = [];

// Cadastro de usuário
router.post("/cadastrar", (req, res) => {
  const { nome, email, senha, preferencias } = req.body;

  if (!nome || !email || !senha || !preferencias) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }

  usuarios.push({ nome, email, senha, preferencias });
  console.log("Usuário cadastrado:", { nome, email, preferencias });

  res.json({ nome, email, preferencias });
});

export default router;
