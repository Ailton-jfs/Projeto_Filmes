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

export default {
  getAll,
  getById,
  newUsuario,
  getByEmail,
};
