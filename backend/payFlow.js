// controllers/payFlow.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// ✅ Correct PagBank Sandbox endpoint (new API)
const SANDBOX_URL = 'https://sandbox.api.pagseguro.com/checkouts';
const TOKEN = process.env.PAGSEGURO_SANDBOX_TOKEN;

/**
 * Create a PagBank Checkout session
 */
export async function createCheckout(req, res) {
  try {
    const { referenceId, customer, items, redirectUrls } = req.body;

    // Validate required fields
    if (!referenceId || !customer || !items || items.length === 0) {
      console.error('❌ Missing required fields:', { referenceId, customer, items, redirectUrls });
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!TOKEN) {
      console.error('❌ PAGSEGURO_SANDBOX_TOKEN not set in .env');
      return res.status(500).json({ success: false, message: 'PagBank API token missing' });
    }

    // ✅ Append referenceId to redirect URL for frontend success tracking
    const redirectUrl = `https://hotel-brasileiro-front.vercel.app/reserva/concluida?referenceId=${referenceId}`;

    const payload = {
      reference_id: referenceId,
      customer,
      items,
      notification_urls: [process.env.PAGSEGURO_NOTIFICATION_URL],
      redirect_url: redirectUrl,
    };

    console.log('📦 Sending payload to PagBank API:\n', JSON.stringify(payload, null, 2));

    const response = await fetch(SANDBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    // Try to parse JSON — fallback to HTML log if not possible
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error('⚠️ PagBank returned non-JSON (likely an HTML error page):');
      console.error(text);
      return res.status(502).json({
        success: false,
        message: 'Invalid response from PagBank (HTML instead of JSON)',
      });
    }

    console.log('✅ PagBank API response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ PagBank API returned error:', data);
      return res.status(response.status).json({ success: false, data });
    }

    // Extract checkout URL
    const checkoutUrl = data.links?.find(l => l.rel === 'PAY')?.href || null;

    if (!checkoutUrl) {
      console.warn('⚠️ No checkout URL returned by PagBank.');
    }

    return res.status(200).json({
      success: true,
      checkoutUrl,
      data,
    });
  } catch (error) {
    console.error('💥 Error in createCheckout:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Handle PagBank payment notifications
 */
export async function handleNotification(req, res) {
  try {
    const notification = req.body;
    console.log('📩 Received PagBank notification:', JSON.stringify(notification, null, 2));

    // Extract reference_id and status for your database logic
    const { reference_id, status } = notification;

    if (reference_id && status) {
      // TODO: Update reservation/payment status in your database
      console.log(`🔁 Updating reservation ${reference_id} → ${status}`);
    } else {
      console.warn('⚠️ Notification missing reference_id or status.');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('💥 Notification handler error:', error);
    res.status(500).json({ success: false });
  }
}

/**
 * Get payment status by reference ID
 */
export async function getPaymentStatus(req, res) {
  try {
    const { paymentReferenceId } = req.params;

    if (!paymentReferenceId) {
      return res.status(400).json({ success: false, message: 'Payment reference ID is required' });
    }

    // Simulated example: you’d normally fetch this from your DB
    const paymentStatus = {
      success: true,
      status: 'CONFIRMED', // Example fixed status for now
    };

    console.log(`ℹ️ Returning mock payment status for ${paymentReferenceId}: CONFIRMED`);

    return res.status(200).json(paymentStatus);
  } catch (error) {
    console.error('💥 Error fetching payment status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}




