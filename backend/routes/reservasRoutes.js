import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
  buscarReservas,
  buscarReservaId,
  atualizarReserva,
  deletarReserva,
  getReservasUsuario,
  getEstatisticasReservas
} from '../controllers/reservasController.js';

const router = express.Router();

// Rota para estatísticas (deve vir antes de :id)
router.get('/estatisticas', authenticateToken, getEstatisticasReservas);

// Rota para reservas do usuário logado
router.get('/minhas-reservas', authenticateToken, getReservasUsuario);

// Todas as rotas que precisam de usuário autenticado usam middleware
router.get('/', authenticateToken, buscarReservas);
router.get('/:id', authenticateToken, buscarReservaId);
router.put('/:id', authenticateToken, atualizarReserva);
router.delete('/:id', deletarReserva);

export default router;