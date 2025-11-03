import { connection } from "./connectionModel";
import iUsuario from "../interfaces/iUsuario";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

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
const editPartial = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updates: Partial<iUsuario> = req.body;

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
  if (updates.senha !== undefined) {
    const hash = await bcrypt.hash(updates.senha, 10);
    fields.push("senha = ?");
    values.push(hash);
  }
  if (updates.preferencias !== undefined) {
    fields.push("preferencias = ?");
    values.push(updates.preferencias);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  const query = `UPDATE usuario SET ${fields.join(", ")}, updatedAt = NOW() WHERE id = ?`;
  values.push(id);

  await connection.execute(query, values);

  const [rows]: any = await connection.execute("SELECT * FROM usuario WHERE id = ?", [id]);
  return res.status(200).json(rows[0]);
};

const removeUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await connection.execute("DELETE FROM usuario WHERE id = ?", [id]);
  return res.sendStatus(204);
};

export default {
  getAll,
  getById,
  newUsuario,
  getByEmail,
  editPartial,
  removeUser,
};

