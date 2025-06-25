import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import quartosRoutes from './routes/quartosRoutes.js';
import clientesRoutes from './routes/clientesRoutes.js';
import reservasRoutes from './routes/reservasRoutes.js';

import { sql } from './config/db.js';

// Importação dos módulos necessários para o servidor Express, segurança, logs, CORS, variáveis de ambiente, documentação Swagger, autenticação e banco de dados

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

// Middlewares globais para segurança, logs, CORS e JSON
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: 'https://hotel-brasileiro-front.vercel.app',
  exposedHeaders: ['Authorization'] // Permite que o frontend acesse o header
}));

// Carrega e serve a documentação Swagger na rota /api-docs
const swaggerDocument = YAML.load(path.join(process.cwd(), 'docs', 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota de login: autentica o usuário, valida senha e retorna JWT
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
  }

  try {
    const [user] = await sql`
      SELECT * FROM clientes WHERE email = ${email};
    `;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({  success: true, token, role: user.role });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
});

// Rotas principais da API para quartos, clientes e reservas
app.use('/api/quartos', quartosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/reservas', reservasRoutes);

// Função para inicializar o banco de dados e criar tabelas se não existirem
async function startdb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        telefone VARCHAR(255) NOT NULL,
        senha VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'cliente' :: character varying
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS quartos (
        id SERIAL PRIMARY KEY,
        imagem_url VARCHAR(255),
        nome VARCHAR(255) NOT NULL,
        descricao VARCHAR(2555),
        preco DECIMAL(10,2) NOT NULL,
        quantidade INTEGER NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reservas (
        id SERIAL PRIMARY KEY,
        quarto_id INTEGER REFERENCES quartos(id),
        cliente_id INTEGER REFERENCES clientes(id),
        hospedes INTEGER NOT NULL,
        inicio DATE NOT NULL,
        fim DATE NOT NULL,
        preco_total DECIMAL(10,2)
      );
    `;

    console.log('db conectada');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
}

// Inicializa o banco e inicia o servidor na porta definida
startdb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});