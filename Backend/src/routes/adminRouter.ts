// src/routes/adminRouter.ts (Atualizado)

import { Router } from "express";
import adminController from "../controller/adminController";
import authAdmin from "../middleware/authAdmin"; 

const adminRouter = Router();

// 🔑 Rota de Login (NÃO PROTEGIDA)
adminRouter.post("/login", adminController.login);

// 🛡️ Aplica o middleware de proteção (authAdmin) a TODAS as rotas subsequentes.
adminRouter.use(authAdmin); 

// 📊 Dashboard
adminRouter.get("/dashboard-metrics", adminController.getDashboardMetrics);

// 👥 Gerenciamento de Usuários (CRUD COMPLETO)

// ➕ POST /usuarios: CRIA UM NOVO USUÁRIO
adminRouter.post("/usuarios", adminController.createUser); 

// GET /usuarios: Lista todos os usuários
adminRouter.get("/usuarios", adminController.listUsers); 

// GET /usuarios/:id: Busca um único usuário (Edição - Carregar dados)
adminRouter.get("/usuarios/:id", adminController.getUserById);     

// PUT /usuarios/:id: Atualiza um usuário
adminRouter.put("/usuarios/:id", adminController.updateUser);     

// DELETE /usuarios/:id: Exclui um usuário
adminRouter.delete("/usuarios/:id", adminController.deleteUser); 

export default adminRouter;