// backend/routes/payFlowRoute.js
import express from "express";
import {
  createCheckout,
  handleNotification,
  getPaymentStatus,
} from "../payFlow.js";

const router = express.Router();

// Create checkout
router.post("/create-checkout", createCheckout);

// Get payment status
router.get("/status/:referenceId", getPaymentStatus);

// Handle webhook notifications
router.post("/notifications", handleNotification);

export default router;
