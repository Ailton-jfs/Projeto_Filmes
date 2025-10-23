import {app} from '../app';
import {config} from 'dotenv'
config()
import express from "express";
import cors from "cors";
import router from "./api";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001

app.use(cors());
app.use("/api", router);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));