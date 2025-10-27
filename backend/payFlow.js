// backend/payFlow.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const PAGSEGURO_URL = "https://sandbox.api.pagseguro.com/orders";
const TOKEN = process.env.PAGSEGURO_SANDBOX_TOKEN;

/**
 * 🧾 Create a PagBank Checkout (payment link)
 */
export async function createCheckout(req, res) {
  try {
    const { referenceId, customer, items, redirectUrls } = req.body;

    // Basic validation
    if (!referenceId || !customer || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Build payload for PagBank API
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
      redirect_url: `https://hotel-brasileiro-front.vercel.app/reserva/concluida?ref=${referenceId}`,
      notification_urls: [process.env.PAGSEGURO_NOTIFICATION_URL],
    };

    console.log("📦 Sending payload to PagBank API:\n", JSON.stringify(payload, null, 2));

    const response = await fetch(PAGSEGURO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.links) {
      const checkoutUrl = data.links.find((l) => l.rel === "PAY")?.href;
      console.log("✅ Checkout created successfully:", checkoutUrl);
      return res.status(200).json({ success: true, checkoutUrl, data });
    } else {
      console.error("❌ PagBank API error:", data);
      return res.status(500).json({ success: false, error: data });
    }
  } catch (error) {
    console.error("💥 Error creating checkout:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

/**
 * 📊 Get payment status by reference ID
 */
export async function getPaymentStatus(req, res) {
  const { referenceId } = req.params;

  if (!referenceId) {
    return res.status(400).json({ error: "Reference ID is required" });
  }

  try {
    const response = await fetch(
      `https://sandbox.api.pagseguro.com/orders?reference_id=${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    const data = await response.json();

    console.log(`📄 Payment status for ${referenceId}:`, JSON.stringify(data, null, 2));
    res.status(200).json(data);
  } catch (error) {
    console.error("💥 Error fetching payment status:", error);
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
}

/**
 * 🔔 Handle PagBank Webhook Notifications
 */
export async function handleNotification(req, res) {
  try {
    console.log("🔔 PagBank notification received:", JSON.stringify(req.body, null, 2));
    // TODO: handle reservation/payment update logic here
    res.status(200).send("Notification received");
  } catch (error) {
    console.error("💥 Notification handler error:", error);
    res.status(500).json({ error: "Failed to handle notification" });
  }
}

