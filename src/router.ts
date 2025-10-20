import express from "express";
import usuarioController from "./controller/usuarioController";

export const router = express.Router();

router.get('/', usuarioController.getAll);
router.get('/usuario/:id', usuarioController.getById);
router.post('/usuario', usuarioController.newUsuario);
router.put('/usuario/:id', usuarioController.editUsuario);
router.patch('/usuario/:id', usuarioController.editPartial);
router.delete('/usuario/:id', usuarioController.removeUsuario);