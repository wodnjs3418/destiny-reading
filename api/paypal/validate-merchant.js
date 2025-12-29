// Vercel Serverless Function - Apple Pay Merchant Validation

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

  const { validationUrl, displayName } = req.body;

  if (!validationUrl) {
    return res.status(400).json({ error: 'Validation URL required' });
  }

  try {
    const accessToken = await getAccessToken();

    // PayPal Apple Pay merchant validation
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing-agreements/agreements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        validationUrl,
        displayName: displayName || 'Lumina Destiny'
      })
    });

    const merchantSession = await response.json();

    if (!response.ok) {
      console.error('Merchant validation error:', merchantSession);
      return res.status(response.status).json(merchantSession);
    }

    console.log('✅ Merchant validated');
    return res.status(200).json(merchantSession);

  } catch (error) {
    console.error('Validate merchant error:', error);
    return res.status(500).json({ error: error.message });
  }
}
