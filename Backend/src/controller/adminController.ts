// src/controllers/AdminController.ts

import { Request, Response } from 'express';
import AdminService from '../services/AdminService';

// =========================================================================
// FUNÇÕES DE AUTENTICAÇÃO E MÉTRICAS
// =========================================================================

// 🔑 Função para Login de Administrador
async function login(req: Request, res: Response): Promise<Response> {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Informe e-mail e senha." });
    }

    try {
        const result = await AdminService.authenticateAdmin(email, senha);
        
        return res.json({
            mensagem: "Login de Admin realizado com sucesso!",
            token: result.token,
            admin: result.admin
        });
        
    } catch (error) {
        const message = (error as Error).message;
        
        if (message.includes("Credenciais") || message.includes("acesso negado")) {
            return res.status(401).json({ erro: message });
        }
        
        console.error("Erro interno no login de Admin:", error);
        return res.status(500).json({ erro: "Erro interno no login." });
    }
}

// 📊 Rota protegida para obter métricas da dashboard
async function getDashboardMetrics(req: Request, res: Response): Promise<Response> {
    try {
        const metrics = await AdminService.getMetrics();
        return res.json(metrics);
    } catch (error) {
        console.error("Erro ao obter métricas do Dashboard:", error);
        return res.status(500).json({ erro: "Falha ao carregar dados do sistema." });
    }
}

// =========================================================================
// ➕ FUNÇÃO NOVA: CRIAÇÃO DE USUÁRIOS (POST)
// =========================================================================

async function createUser(req: Request, res: Response): Promise<Response> {
    const { nome, email, senha, is_admin } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios para criar um usuário." });
    }

    try {
        // Assume-se que o AdminService tem um método 'createUser' para hash da senha e salvamento no DB
        const novoUsuario = await AdminService.createUser({ nome, email, senha, is_admin: is_admin ?? false });

        // Retorna 201 Created com os dados do novo usuário (sem a senha)
        return res.status(201).json({
            mensagem: "Usuário criado com sucesso!",
            usuario: { 
                id: novoUsuario.id, 
                nome: novoUsuario.nome, 
                email: novoUsuario.email, 
            
            }
        });
    } catch (error) {
        const message = (error as Error).message;
        
        // Trata erro de e-mail duplicado
        if (message.includes("E-mail já registrado")) {
            return res.status(409).json({ erro: message });
        }

        console.error("Erro ao criar usuário:", error);
        return res.status(500).json({ erro: "Falha ao criar o usuário." });
    }
}


// =========================================================================
// FUNÇÕES DE CRUD DE USUÁRIOS (READ, UPDATE, DELETE)
// =========================================================================

// 📄 Listar Usuários (READ ALL)
async function listUsers(req: Request, res: Response): Promise<Response> {
    try {
        const usuarios = await AdminService.listUsers();
        return res.json(usuarios);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        return res.status(500).json({ erro: "Falha ao carregar a lista de usuários." });
    }
}

// 🔎 Obter Usuário por ID (READ ONE - Para carregar o formulário de edição)
async function getUserById(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ erro: "ID de usuário inválido." });
    }

    try {
        const usuario = await AdminService.getUserById(id); 

        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        return res.json(usuario);
    } catch (error) {
        console.error(`Erro ao buscar usuário ID ${id}:`, error);
        return res.status(500).json({ erro: "Falha ao buscar o usuário." });
    }
}

// 🔄 Atualizar Usuário (UPDATE)
async function updateUser(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    const dadosAtualizados = req.body; 

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ erro: "ID de usuário inválido." });
    }
    
    if (Object.keys(dadosAtualizados).length === 0) {
        return res.status(400).json({ erro: "Nenhum dado válido fornecido para atualização." });
    }

    try {
        const usuarioAtualizado = await AdminService.updateUser(id, dadosAtualizados); 

        return res.json(usuarioAtualizado);

    } catch (error) {
        const message = (error as Error).message;
        
        if (message.includes("não encontrado")) {
            return res.status(404).json({ erro: message });
        }
        if (message.includes("E-mail já registrado")) {
            return res.status(409).json({ erro: message });
        }
        
        console.error(`Erro ao atualizar usuário ID ${id}:`, error);
        return res.status(500).json({ erro: "Falha ao atualizar o usuário." });
    }
}

// ❌ Excluir Usuário (DELETE)
async function deleteUser(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ erro: "ID de usuário inválido." });
    }

    try {
        // Assume-se que 'usuarioModel' ou 'AdminService' tem a lógica de remoção.
        // Vou assumir aqui que você moveria a lógica de exclusão para o AdminService.
        const sucesso = await AdminService.deleteUser(id); 

        if (sucesso) {
            return res.status(204).send(); 
        } else {
            return res.status(404).json({ erro: `Usuário ID ${id} não encontrado.` });
        }
    } catch (error) {
        console.error(`Erro ao excluir usuário ID ${id}:`, error);
        return res.status(500).json({ erro: "Falha ao excluir o usuário." });
    }
}


export default {
    login,
    getDashboardMetrics,
    createUser,    // ➡️ NOVO: Exportando a função de criação
    listUsers,
    getUserById,
    updateUser,
    deleteUser,
};