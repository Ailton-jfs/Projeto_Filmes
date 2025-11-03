import iUsuario from "../interfaces/iUsuario";
import usuarioModel from "../model/usuarioModel";
import { Request, Response } from "express";

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
  const newU = await usuarioModel.newUsuario(req.body);
  return res.status(200).json(newU);
}

const editPartial = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updates: Partial<iUsuario> = req.body;
    const result = await usuarioModel.editPartial(id, updates, req.body);
    return res.status(200).json(result);
}

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