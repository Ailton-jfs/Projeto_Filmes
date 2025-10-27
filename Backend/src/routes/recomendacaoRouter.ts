import { Router } from "express";
import { recomendarFilmes } from "../controller/recomendacaoController";

const router = Router();
router.post("/recomendar", recomendarFilmes);

export default router;
