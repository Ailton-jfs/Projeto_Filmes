import { Sequelize } from "sequelize";
import { config } from "dotenv";

config();

export const sequelize = new Sequelize(
  process.env.DATABASE || "projeto_filmes_db",
  process.env.USER || "root",
  process.env.PASSWORD || "",
  {
    host: process.env.HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

export async function conectarBanco() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com MySQL estabelecida com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MySQL:", error);
  }
}
