import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente do arquivo .env para process.env
dotenv.config();

// Desestrutura as variáveis de ambiente necessárias para a conexão com o banco de dados
const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE } = process.env;

// Conexão do banco de dados usando as variaveis declaradas no .env
export const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);
