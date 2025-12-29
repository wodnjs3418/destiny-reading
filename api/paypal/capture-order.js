// Vercel Serverless Function - PayPal Capture Order

const PAYPAL_API_BASE = process.env.PAYPAL_SANDBOX === 'true'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

async function getAccessToken() {
  const clientId = process.env.VITE_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderID } = req.body;

  if (!orderID) {
    return res.status(400).json({ error: 'Order ID required' });
  }

  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const captureData = await response.json();

    if (!response.ok) {
      console.error('PayPal capture error:', captureData);
      return res.status(response.status).json(captureData);
    }

    // 결제 검증
    if (captureData.status !== 'COMPLETED') {
      return res.status(400).json({
        error: 'Payment not completed',
        status: captureData.status
      });
    }

    const captures = captureData.purchase_units?.[0]?.payments?.captures;
    if (!captures || captures.length === 0) {
      return res.status(400).json({ error: 'No captures found' });
    }

    const capturedAmount = parseFloat(captures[0].amount.value);
    if (capturedAmount !== 9.99) {
      return res.status(400).json({
        error: 'Invalid amount',
        expected: 9.99,
        received: capturedAmount
      });
    }

    console.log('✅ Payment captured:', captureData.id, 'Amount:', capturedAmount);

    return res.status(200).json({
      success: true,
      orderID: captureData.id,
      status: captureData.status,
      captureID: captures[0].id,
      amount: capturedAmount
    });

  } catch (error) {
    console.error('Capture order error:', error);
    return res.status(500).json({ error: error.message });
  }
}
