import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import upload from '../config/multerconfig.js';
import {
  buscarClientes,
  buscarClienteId,
  criarCliente,
  atualizarCliente,
  deletarCliente,
  buscarClienteMe,
  buscarReservasCliente,
  atualizarFotoPerfil,
  enviarTokenRecuperacao,
  verificarTokenRecuperacao,
  redefinirSenhaPorEmail
} from '../controllers/clientesController.js';
import {
  buscarReservas,
  criarReserva,
  buscarReservaId,
  atualizarReserva,
  deletarReserva,
  getReservasUsuario,
  getEstatisticasReservas,
} from '../controllers/reservasController.js';

const router = express.Router();

// Todas as rotas que precisam de usuário autenticado usam middleware
router.get('/', authenticateToken, buscarClientes);
router.get('/me', authenticateToken, buscarClienteMe);
router.get('/:id', authenticateToken, buscarClienteId);
router.get('/:id/reservas', authenticateToken, buscarReservasCliente);
router.put('/:id', authenticateToken, atualizarCliente);
router.delete('/:id', authenticateToken, deletarCliente);
router.post('/', criarCliente);
router.post('/send-token', enviarTokenRecuperacao);
router.post('/send-token-verify', verificarTokenRecuperacao);

// Rota para redefinir senha usando email
router.post('/update-password', redefinirSenhaPorEmail);
router.put('/:id/ft_perfil', upload.single('ft_perfil'), atualizarFotoPerfil);

// Rota para reservas
router.post('/reservas', authenticateToken, criarReserva);
router.get('/reservas/:id', authenticateToken, buscarReservaId);
router.put('/reservas/:id', authenticateToken, atualizarReserva);
router.delete('/reservas/:id', authenticateToken, deletarReserva);
router.get('/reservas/usuario', authenticateToken, getReservasUsuario);
router.get('/reservas/estatisticas', authenticateToken, getEstatisticasReservas);

export default router;