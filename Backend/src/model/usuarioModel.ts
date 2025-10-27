import  {connection} from "./connectionModel";
import iUsuario from "../interfaces/iUsuario";

const getAll = async () => {
  const [listUsuarios] = await connection.execute('SELECT * FROM User');
  return listUsuarios;
}

const getById = async (id: number) => {
  const [usuario] = await connection.execute('SELECT * FROM User WHERE id = $[id]');
  return usuario;
}

const newUsuario = async (body: iUsuario) => {
  const { name, email, password } = body;
  const query = 'INSERT INTO User (name, email, password) value (?, ?, ?)';
  const [newP] = await connection.execute(query, [name, email, password]);
  return newP;
}

const editUsuario = async (id: number, body: iUsuario) => {
  const { name, email, password } = body;
  const query = 'UPDATE User SET name = ?, email = ?, password = ? WHERE id = ?';
  const [editP] = await connection.execute(query, [name, email, password, id]);
  return editP;
}

const editPartial = async (id: number, updates: Partial<iUsuario>, body: iUsuario) => {
    delete updates.createdAt
    if (!updates.updatedAt) {
         updates.updatedAt = new Date()
    }

    const fields = Object.keys(updates)
    const values = Object.values(updates)

    const setclause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE User set ${setclause} updatedAt = NOW() WHERE id = ?`;
    const result = await connection.execute(query, [...values, id]);
    return result;  
}

const removeUsuario = async (id: number) => {
  const removeUr = await connection.execute(`DELETE FROM User WHERE id = ${id}`);
  return removeUr;
}

export default {
    getAll,
    getById,
    newUsuario,
    editUsuario,
    editPartial,
    removeUsuario
}