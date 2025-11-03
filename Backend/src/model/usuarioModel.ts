// Código usuarioModel (ATUALIZADO)
import { connection } from "./connectionModel";
import iUsuario from "../interfaces/iUsuario";
import bcrypt from "bcrypt";

const getAll = async () => {
  const [rows]: any = await connection.execute("SELECT * FROM usuario");
  return rows;
};

const getById = async (id: number) => {
  const [rows]: any = await connection.execute("SELECT * FROM usuario WHERE id = ?", [id]);
  return rows[0];
};

const newUsuario = async (body: iUsuario) => {
  const { nome, email, senha, preferencias } = body;

  // Criptografa a senha antes de salvar
  const hash = await bcrypt.hash(senha, 10);

  const query = "INSERT INTO usuario (nome, email, senha, preferencias, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())";
  const [result]: any = await connection.execute(query, [nome, email, hash, preferencias]);

  return { id: result.insertId, nome, email, preferencias };
};

const getByEmail = async (email: string) => {
  const [rows]: any = await connection.execute("SELECT * FROM usuario WHERE email = ?", [email]);
  return rows[0];
};

// 🔑 NOVO: Implementação da edição parcial
const editPartial = async (id: number, updates: Partial<iUsuario>, originalBody: any) => {
    // Remove 'senha' dos updates se não estiver presente (para evitar hash desnecessário)
    delete originalBody.senha; 
    
    // Constrói a query de forma dinâmica
    const keys = Object.keys(originalBody);
    const values = Object.values(originalBody);

    if (keys.length === 0) return null; // Nada para atualizar

    const setClauses = keys.map(key => `${key} = ?`).join(', ');
    const query = `UPDATE usuario SET ${setClauses}, updatedAt = NOW() WHERE id = ?`;

    const [result]: any = await connection.execute(query, [...values, id]);
    return result.affectedRows > 0 ? { id, ...originalBody } : null;
}

// 🔑 NOVO: Implementação da remoção
const removeUsuario = async (id: number) => {
    const [result]: any = await connection.execute("DELETE FROM usuario WHERE id = ?", [id]);
    return result.affectedRows > 0;
}

export default {
  getAll,
  getById,
  newUsuario,
  getByEmail,
  editPartial,
  removeUsuario
};