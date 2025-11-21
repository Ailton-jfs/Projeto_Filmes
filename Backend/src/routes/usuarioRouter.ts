import { Router } from "express";
import usuarioModel from "../model/usuarioModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta";

// CADASTRO
router.post("/cadastrar", async (req, res) => {
  try {
    const { nome, email, senha, preferencias } = req.body;
    if (!nome || !email || !senha || !preferencias)
      return res.status(400).json({ erro: "Preencha todos os campos." });

    const usuarioExistente = await usuarioModel.getByEmail(email);
    if (usuarioExistente) return res.status(400).json({ erro: "E-mail já cadastrado." });

    const novoUsuario = await usuarioModel.newUsuario({ nome, email, senha, preferencias });
    return res.status(201).json(novoUsuario);

  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro);
    return res.status(500).json({ erro: "Erro interno ao cadastrar." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: "Informe e-mail e senha." });

    const usuario = await usuarioModel.getByEmail(email);
    if (!usuario) return res.status(404).json({ erro: "Usuário não cadastrado." });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ erro: "Senha incorreta." });

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: "2h" });

    return res.json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        preferencias: usuario.preferencias
      }
    });

  } catch (erro) {
    console.error("Erro no login:", erro);
    return res.status(500).json({ erro: "Erro interno no login." });
  }
});

// RECUPERAR SENHA
router.post("/recuperarSenha", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ erro: "Informe o e-mail." });

    const usuario = await usuarioModel.getByEmail(email);
    if (!usuario) return res.status(404).json({ erro: "E-mail não cadastrado." });

    return res.status(200).json({ mensagem: `Um link de recuperação foi enviado para ${email}.` });

  } catch (erro) {
    console.error("Erro ao recuperar senha:", erro);
    return res.status(500).json({ erro: "Erro interno ao recuperar senha." });
  }
});


// 🚀 ATUALIZAR PERFIL (PATCH /api/usuarios/:id) - CORRIGIDO
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha } = req.body;
    
    if (!nome || !email) {
      return res.status(400).json({ erro: "Nome e e-mail são obrigatórios." });
    }

    let senhaHash;
    if (senha) {
      senhaHash = await bcrypt.hash(senha, 10);
    }

    // 🔑 CORREÇÃO: Chamando o método 'editPartial' do seu modelo
    const usuarioAtualizado = await usuarioModel.editPartial(Number(id), {
      nome,
      email,
      ...(senhaHash !== undefined ? { senha: senhaHash } : {})
    });

    // Seu modelo editPartial retorna o objeto completo atualizado
    if (!usuarioAtualizado) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }
    
    // Retorna os dados atualizados para que o frontend salve no localStorage
    return res.json({
      id: usuarioAtualizado.id,
      nome: usuarioAtualizado.nome,
      email: usuarioAtualizado.email,
      preferencias: usuarioAtualizado.preferencias || null
    });

  } catch (erro) {
    console.error("Erro ao atualizar usuário:", erro);
    return res.status(500).json({ erro: "Erro interno ao atualizar perfil." });
  }
});

export default router;