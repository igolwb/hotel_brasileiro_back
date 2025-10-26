// backend/payFlow.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const PAGSEGURO_URL = "https://sandbox.api.pagseguro.com/orders";

router.post("/create-checkout", async (req, res) => {
  try {
    const { referenceId, customer, items, redirectUrls } = req.body;

    if (!referenceId || !customer || !items) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const payload = {
      reference_id: referenceId,
      customer,
      items,
      shipping: {
        address: {
          street: "Rua Teste",
          number: "123",
          locality: "Centro",
          city: "São Paulo",
          region_code: "SP",
          country: "BRA",
          postal_code: "01000000",
        },
      },
      // ✅ Add referenceId to redirect URL
      redirect_url: `https://hotel-brasileiro-front.vercel.app/reserva/concluida?ref=${referenceId}`,
      notification_urls: [process.env.PAGSEGURO_NOTIFICATION_URL],
    };

    const response = await fetch(PAGSEGURO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAGSEGURO_SANDBOX_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.links) {
      const checkoutUrl = data.links.find((l) => l.rel === "PAY").href;
      res.status(200).json({ success: true, checkoutUrl });
    } else {
      console.error("PagBank error:", data);
      res.status(500).json({ success: false, error: data });
    }
  } catch (error) {
    console.error("Error creating checkout:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ✅ Verify payment status
router.get("/status/:referenceId", async (req, res) => {
  const { referenceId } = req.params;
  try {
    const response = await fetch(
      `https://sandbox.api.pagseguro.com/orders?reference_id=${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAGSEGURO_SANDBOX_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

// ✅ Webhook notifications from PagBank
router.post("/notifications", async (req, res) => {
  console.log("🔔 PagBank notification received:", req.body);
  res.status(200).send("Notification received");
});

export default router;
