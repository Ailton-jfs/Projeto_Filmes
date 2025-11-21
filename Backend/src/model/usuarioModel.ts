// src/model/usuarioModel.ts

import { getConnection } from "./connectionModel";
import iUsuario from "../interfaces/iUsuario";
import bcrypt from "bcrypt";

// 🔹 Lista todos os usuários
const getAll = async () => {
    const conn = await getConnection();
    const [rows]: any = await conn.execute("SELECT * FROM usuario");
    return rows;
};

// 🔹 Busca um usuário pelo ID
const getById = async (id: number) => {
    const conn = await getConnection();
    const [rows]: any = await conn.execute("SELECT * FROM usuario WHERE id = ?", [id]);
    return rows[0];
};

// 🔹 Cria um novo usuário
const newUsuario = async (body: iUsuario) => {
    const conn = await getConnection();
    const { nome, email, senha, preferencias } = body;

    const hash = await bcrypt.hash(senha, 10);
    
    // CORREÇÃO: A consulta agora começa exatamente com 'INSERT' sem espaços indesejados
    const query = `INSERT INTO usuario (nome, email, senha, preferencias, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())`;
    
    const [result]: any = await conn.execute(query, [nome, email, hash, preferencias]);
    return { id: result.insertId, nome, email, preferencias };
};

// 🔹 Busca usuário por e-mail
const getByEmail = async (email: string) => {
    const conn = await getConnection();
    // ⚠️ ATENÇÃO: Adicione 'is_admin' aqui para que o login do admin funcione!
    const [rows]: any = await conn.execute("SELECT * FROM usuario WHERE email = ?", [email]); 
    return rows[0];
};

// 🔹 Atualização parcial (edição de campos específicos)
const editPartial = async (id: number, updates: Partial<iUsuario>) => {
    const conn = await getConnection();

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.nome !== undefined) {
        fields.push("nome = ?");
        values.push(updates.nome);
    }
    if (updates.email !== undefined) {
        fields.push("email = ?");
        values.push(updates.email);
    }
    
    // 🔑 CORREÇÃO: Remove o hash. O valor de 'updates.senha' já é o hash gerado no Router.
    if (updates.senha !== undefined) {
        fields.push("senha = ?");
        values.push(updates.senha); 
    }
    if (updates.preferencias !== undefined) {
        fields.push("preferencias = ?");
        values.push(updates.preferencias);
    }

    if (fields.length === 0) {
        throw new Error("Nenhum campo para atualizar");
    }

    const query = `UPDATE usuario SET ${fields.join(", ")}, updatedAt = NOW() WHERE id = ?`;
    values.push(id);

    await conn.execute(query, values);

    const [rows]: any = await conn.execute("SELECT * FROM usuario WHERE id = ?", [id]);
    return rows[0];
};

// 🔹 Remove usuário pelo ID
const removeUsuario = async (id: number) => {
    const conn = await getConnection();
    const [result]: any = await conn.execute("DELETE FROM usuario WHERE id = ?", [id]);
    return result.affectedRows > 0;
};


// =========================================================================
// 🚀 NOVAS FUNÇÕES PARA ADMINISTRAÇÃO
// =========================================================================

// 📊 Conta o número total de usuários para o Dashboard
const countAll = async (): Promise<number> => {
    const conn = await getConnection();
    const [rows]: any = await conn.execute("SELECT COUNT(*) as total FROM usuario");
    return rows[0].total;
};

// 📄 Lista todos os usuários, mas com campos básicos (sem senha)
const getAllBasic = async () => {
    const conn = await getConnection();
    const [rows]: any = await conn.execute(
        "SELECT id, nome, email, is_admin, createdAt FROM usuario ORDER BY createdAt DESC"
    );
    return rows;
};

// =========================================================================
// 🔄 EXPORTAÇÃO
// =========================================================================

export default {
    getAll,
    getById,
    newUsuario,
    getByEmail,
    editPartial,
    removeUsuario,
    // ➡️ Novas exportações
    countAll,
    getAllBasic,
};