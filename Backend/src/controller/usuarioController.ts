import iUsuario from "../interfaces/iUsuario";
import usuarioModel from "../model/usuarioModel";
import { Request, Response } from "express";
import * as bcrypt from "bcrypt"; // Importa a biblioteca bcrypt

// --- Configurações de Validação de Senha ---
// Pelo menos uma letra maiúscula
const REGEX_UPPER = /[A-Z]/; 
// Pelo menos um caractere especial
const REGEX_SPECIAL = /[!@#$%^&*()_+={}\[\]|:;\"'<,>.?/~`]/; 
// Nível de complexidade para o hash (recomendado: 10 a 12)
const SALT_ROUNDS = 10; 
// -------------------------------------------

const getAll = async (req: Request, res: Response) => {
  const listUsuarios = await usuarioModel.getAll();
  return res.status(200).json(listUsuarios);
}

const getById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const usuario = await usuarioModel.getById(id);
  return res.status(200).json(usuario);
}

const newUsuario = async (req: Request, res: Response) => {
  const novoUsuario: iUsuario = req.body;
  const { senha } = novoUsuario;

  // 1. VALIDAÇÃO DA SENHA NO BACKEND
  if (!senha || typeof senha !== 'string') {
    return res.status(400).json({ erro: 'A senha é obrigatória.' });
  }

  if (senha.length < 8) {
    return res.status(400).json({ erro: 'A senha deve ter no mínimo 8 caracteres.' });
  }

  if (!REGEX_UPPER.test(senha)) {
    return res.status(400).json({ erro: 'A senha deve conter pelo menos uma letra maiúscula.' });
  }

  if (!REGEX_SPECIAL.test(senha)) {
    return res.status(400).json({ erro: 'A senha deve conter pelo menos um caractere especial (!@#$...).' });
  }

  try {
    // 2. HASH DA SENHA ANTES DE SALVAR NO BANCO
    const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);
    
    // Atualiza o objeto do novo usuário com a senha hasheada
    novoUsuario.senha = hashedPassword;

    // 3. CHAMA O MODEL COM O OBJETO ATUALIZADO
    const newU = await usuarioModel.newUsuario(novoUsuario);
    // Remove a senha hasheada do retorno para o cliente por segurança, 
    // mesmo que o model não retorne, é uma boa prática.
    const usuarioRetorno = ((obj: any) => {
      const { senha, ...rest } = obj;
      return rest;
    })(newU);
    
    return res.status(201).json(usuarioRetorno); 
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return res.status(500).json({ erro: 'Ocorreu um erro interno no servidor durante o cadastro.' });
  }
}

const editPartial = async (req: Request, res: Response) => {
    const updates: Partial<iUsuario> = req.body;
    const id = Number(req.params.id);

    // 1. Verifica se a senha está sendo atualizada
    if (updates.senha) {
        const senha = updates.senha;

        // 2. VALIDAÇÃO DA SENHA (Repete a lógica de newUsuario)
        if (typeof senha !== 'string') {
            return res.status(400).json({ erro: 'A senha deve ser uma string válida.' });
        }

        if (senha.length < 8) {
            return res.status(400).json({ erro: 'A senha deve ter no mínimo 8 caracteres.' });
        }

        if (!REGEX_UPPER.test(senha)) {
            return res.status(400).json({ erro: 'A senha deve conter pelo menos uma letra maiúscula.' });
        }

        if (!REGEX_SPECIAL.test(senha)) {
            return res.status(400).json({ erro: 'A senha deve conter pelo menos um caractere especial (!@#$...).' });
        }

        try {
            // 3. HASH DA SENHA ANTES DE ATUALIZAR
            const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);
            
            // Substitui a senha em texto plano pela senha hasheada no objeto de updates
            updates.senha = hashedPassword; 
        } catch (error) {
            console.error("Erro ao fazer hash da senha em editPartial:", error);
            return res.status(500).json({ erro: 'Erro interno ao processar a senha.' });
        }
    } 
    // Se updates.senha não existir, não faz nada e passa o updates original.

    try {
        // 4. CHAMA O MODEL com as updates (que podem incluir a senha hasheada)
        const result = await usuarioModel.editPartial(id, updates);

        // Remove a senha do retorno por segurança
        const { senha: _, ...usuarioRetorno } = result;

        return res.status(200).json(usuarioRetorno);
    } catch (error) {
        console.error("Erro ao editar usuário em editPartial:", error);
        return res.status(500).json({ erro: 'Ocorreu um erro interno no servidor durante a edição.' });
    }
};

const removeUsuario = async (req: Request, res: Response) => {
  const removeU = await usuarioModel.removeUsuario(Number(req.params.id));
  return res.status(200).json({message: "Usuário foi deletado !!!"});
}

export default {
    getAll,
    getById,
    newUsuario,
    editPartial,
    removeUsuario
}