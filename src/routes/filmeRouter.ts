import { Router } from "express";
import { getFilmesPopulares, getRecomendacoes } from "../controller/filmeController";

const router = Router();

router.get("/populares", getFilmesPopulares);
router.get("/:id/recomendacoes", getRecomendacoes);

export default router;
