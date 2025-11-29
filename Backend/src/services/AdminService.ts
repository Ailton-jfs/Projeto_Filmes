// src/services/AdminService.ts

import usuarioModel from "../model/usuarioModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta";
const SALT_ROUNDS = 10; 

interface AdminAuthResult {
    token: string;
    admin: {
        id: number;
        nome: string;
        email: string;
        is_admin: boolean;
    };
}

interface UserData {
    nome?: string;
    email?: string;
    senha?: string;
    is_admin?: boolean;
    preferencias?: string;
}

// =========================================================================
// FUNÇÕES DE AUTENTICAÇÃO E MÉTRICAS
// =========================================================================

// 🔑 Lógica central de autenticação de administrador
async function authenticateAdmin(email: string, senha: string): Promise<AdminAuthResult> {
    const usuario = await usuarioModel.getByEmail(email);

    if (!usuario) {
        throw new Error("Credenciais inválidas.");
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
        throw new Error("Credenciais inválidas.");
    }

    // VERIFICAÇÃO CRÍTICA
    if (!usuario.is_admin) {
        throw new Error("Acesso negado. Você não é um administrador.");
    }

    // Geração do token JWT
    const token = jwt.sign(
        { id: usuario.id, email: usuario.email, is_admin: true }, 
        JWT_SECRET, 
        { expiresIn: "12h" }
    );

    return {
        token,
        admin: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            is_admin: true
        }
    };
}

// 📊 Busca métricas essenciais para o Dashboard
async function getMetrics() {
    const totalUsuarios = await usuarioModel.countAll();
    
    // 💡 Adapte esta linha quando tiver um Model de Filme
    const totalFilmes = 0; 

    return {
        totalUsuarios: totalUsuarios,
        totalFilmes: totalFilmes,
        status: "OK - API Online"
    };
}

// =========================================================================
// FUNÇÕES DE CRUD DE USUÁRIOS (REQUERIDAS PELO ADMIN CONTROLLER)
// =========================================================================
// ➕ Função para Criar Usuário (Chamada pelo AdminController.createUser)
async function createUser(data: UserData) {
    // 1. Verifica se o e-mail já está em uso antes de criar
    const existingUser = await usuarioModel.getByEmail(data.email!);
    if (existingUser) {
        throw new Error("E-mail já registrado.");
    }

    // 2. Cria o hash da senha antes de salvar
    const hashedPassword = await bcrypt.hash(data.senha!, SALT_ROUNDS);
    
    // 3. Monta os dados finais para o Model
    const userDataToSave = {
        nome: data.nome!,
        email: data.email!,
        senha: hashedPassword,
        preferencias: data.preferencias ?? "", // Preenche padrão para satisfazer iUsuario
        is_admin: data.is_admin ?? false // Garante que is_admin seja booleano
    };

    // 4. Salva e retorna o novo usuário (sem a senha)
    return await usuarioModel.newUsuario(userDataToSave);
}


// 📄 Função para Listar Todos os Usuários (Chamada pelo AdminController.listUsers)
async function listUsers() {
    // O Model deve retornar uma lista de usuários, preferencialmente sem a senha
    return await usuarioModel.getAll();
}

// 🔎 Função para Buscar Usuário por ID (Chamada pelo AdminController.getUserById)
async function getUserById(id: number) {
    const usuario = await usuarioModel.getById(id);
    if (!usuario) {
        throw new Error("Usuário não encontrado.");
    }
    // O Model deve retornar o usuário sem a senha
    return usuario;
}

// 🔄 Função para Atualizar Usuário (Chamada pelo AdminController.updateUser)
async function updateUser(id: number, data: UserData) {
    const existingUser = await usuarioModel.getById(id);
    if (!existingUser) {
        throw new Error("Usuário não encontrado para atualização.");
    }

    const updates: any = {};
    if (data.nome !== undefined) updates.nome = data.nome;
    if (data.email !== undefined) {
        // Verifica se o novo e-mail já existe e não pertence a este usuário
        const emailExists = await usuarioModel.getByEmail(data.email);
        if (emailExists && emailExists.id !== id) {
            throw new Error("E-mail já registrado.");
        }
        updates.email = data.email;
    }
    if (data.senha !== undefined && data.senha.length > 0) {
        // Atualiza a senha apenas se for fornecida e não vazia
        updates.senha = await bcrypt.hash(data.senha, SALT_ROUNDS);
    }
    if (data.is_admin !== undefined) updates.is_admin = data.is_admin;


    // O Model deve lidar com a atualização parcial (apenas os campos em 'updates')
    return await usuarioModel.editPartial(id, updates);
}

// ❌ Função para Excluir Usuário (Chamada pelo AdminController.deleteUser)
async function deleteUser(id: number) {
    // O Model deve retornar true se a exclusão foi bem-sucedida, false se não encontrou
    const result = await usuarioModel.removeUsuario(id); 
    
    // Dependendo do seu `usuarioModel.remove`, você pode precisar de uma verificação extra aqui
    if (!result) {
        throw new Error("Usuário não encontrado para exclusão.");
    }
    return true; 
}


export default {
    authenticateAdmin,
    getMetrics,
    createUser,
    listUsers,
    getUserById,
    updateUser,
    deleteUser,
};