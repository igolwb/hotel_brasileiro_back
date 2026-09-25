import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import {
  buscarClientes,
  buscarClienteId,
  criarCliente,
  atualizarCliente,
  deletarCliente,
  buscarClienteMe,
  buscarReservasCliente,
  enviarTokenRecuperacao,
  verificarTokenRecuperacao,
  redefinirSenhaPorEmail,
  confirmarCliente,
  enviarCodigoConfirmacao,
} from "../controllers/clientesController.js";

const router = express.Router();

// Todas as rotas que precisam de usuário autenticado usam middleware
router.get("/", authenticateToken, buscarClientes);
router.get("/me", authenticateToken, buscarClienteMe);
router.get("/:id", authenticateToken, buscarClienteId);
router.get("/:id/reservas", authenticateToken, buscarReservasCliente);
router.put("/:id", authenticateToken, atualizarCliente);
router.delete("/:id", authenticateToken, deletarCliente);
router.post("/", criarCliente);
router.post("/send-token", enviarTokenRecuperacao);
router.post("/send-token-verify", verificarTokenRecuperacao);
router.post("/send-confirmation-code", enviarCodigoConfirmacao);

// Rota para redefinir senha usando email
router.post("/update-password", redefinirSenhaPorEmail);

// Rota para confirmar código e criar cliente definitivo
router.post("/confirm", confirmarCliente);

export default router;
