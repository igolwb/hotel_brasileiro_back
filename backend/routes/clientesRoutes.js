import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
  buscarClientes,
  buscarClienteId,
  criarCliente,
  atualizarCliente,
  deletarCliente,
  buscarClienteMe
} from '../controllers/clientesController.js';

const router = express.Router();

// Todas as rotas que precisam de usuário autenticado usam middleware
router.get('/', authenticateToken, buscarClientes);
router.get('/me', authenticateToken, buscarClienteMe);
router.get('/:id', authenticateToken, buscarClienteId);
router.put('/:id', authenticateToken, atualizarCliente);
router.delete('/:id', authenticateToken, deletarCliente);
router.post('/', criarCliente);

export default router;
