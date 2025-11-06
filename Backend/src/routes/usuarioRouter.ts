import { Router } from "express";
import usuarioModel from "../model/usuarioModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta";

// Rota de cadastro de usuário (salva no MySQL)
router.post("/cadastrar", async (req, res) => {
  console.log("📦 Body recebido:", req.body); 

  try {
    const { nome, email, senha, preferencias } = req.body;

    if (!nome || !email || !senha || !preferencias) {
      return res.status(400).json({ erro: "Preencha todos os campos." });
    }

    // Verifica se o e-mail já está cadastrado
    const usuarioExistente = await usuarioModel.getByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ erro: "E-mail já cadastrado." });
    }

    // Cria o novo usuário
    const novoUsuario = await usuarioModel.newUsuario({ nome, email, senha, preferencias });
    console.log("✅ Usuário cadastrado:", novoUsuario);

    res.status(201).json(novoUsuario);
  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro);
    res.status(500).json({ erro: "Erro interno ao cadastrar usuário." });
  }
});

// Rota de login
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Informe e-mail e senha." });
    }

    const usuario = await usuarioModel.getByEmail(email);
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    // Compara a senha digitada com o hash do banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha incorreta." });
    }

    // Gera token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    console.log("🔐 Login bem-sucedido:", usuario.email);
    res.json({
      mensagem: "Login realizado com sucesso.",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        preferencias: usuario.preferencias,
      },
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    res.status(500).json({ erro: "Erro interno no login." });
  }
});

export default router;
