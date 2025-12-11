// Vercel Serverless Function - Email Delivery with Resend
import { Resend } from 'resend';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Resend API key not configured' });
  }

  try {
    const { email, birthData, analysis, pdfBase64 } = req.body;

    if (!email || !birthData) {
      return res.status(400).json({ error: 'Email and birth data required' });
    }

    const resend = new Resend(RESEND_API_KEY);

    const { year, month, day } = birthData;
    const { element, animal } = analysis;

    // HTML 이메일 템플릿
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #0a0a0f;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #b8860b 0%, #daa520 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 36px;
      font-weight: 700;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      color: rgba(255,255,255,0.9);
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #ffffff;
    }
    .result-box {
      background: rgba(184, 134, 11, 0.1);
      border: 2px solid #b8860b;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    .result-item {
      margin: 12px 0;
      font-size: 16px;
    }
    .result-label {
      color: #daa520;
      font-weight: 600;
      display: inline-block;
      min-width: 120px;
    }
    .result-value {
      color: #ffffff;
      font-weight: 400;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #b8860b 0%, #daa520 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(184, 134, 11, 0.4);
    }
    .footer {
      padding: 30px;
      text-align: center;
      background: rgba(0,0,0,0.3);
      color: rgba(255,255,255,0.6);
      font-size: 13px;
    }
    .footer a {
      color: #daa520;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #b8860b, transparent);
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ LUMINA</h1>
      <p>Your Destiny Decoded</p>
    </div>

    <div class="content">
      <div class="greeting">
        Dear Seeker of Cosmic Wisdom,
      </div>

      <p style="line-height: 1.6; color: rgba(255,255,255,0.9);">
        Your personalized Four Pillars of Destiny reading is complete. The ancient wisdom of BaZi has revealed the cosmic patterns written in the stars at the moment of your birth.
      </p>

      <div class="result-box">
        <h2 style="margin-top: 0; color: #daa520; font-size: 20px;">Your Cosmic Blueprint</h2>
        <div class="divider"></div>
        <div class="result-item">
          <span class="result-label">Birth Date:</span>
          <span class="result-value">${month}/${day}/${year}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Core Element:</span>
          <span class="result-value">${element}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Animal Sign:</span>
          <span class="result-value">${animal}</span>
        </div>
      </div>

      <p style="line-height: 1.6; color: rgba(255,255,255,0.9);">
        Your complete reading is attached as a beautifully formatted PDF. This comprehensive analysis includes:
      </p>

      <ul style="line-height: 1.8; color: rgba(255,255,255,0.8);">
        <li>Deep personality analysis</li>
        <li>Career and life purpose guidance</li>
        <li>Wealth and prosperity insights</li>
        <li>Love and relationship compatibility</li>
        <li>Health recommendations</li>
        <li>Yearly forecasts and lucky elements</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <p style="color: rgba(255,255,255,0.7); font-style: italic; font-size: 15px;">
          "The stars reveal tendencies, not certainties.<br/>Your choices ultimately shape your destiny."
        </p>
      </div>
    </div>

    <div class="footer">
      <p>
        Thank you for choosing <strong style="color: #daa520;">Lumina</strong> for your cosmic journey.
      </p>
      <p style="margin-top: 15px;">
        Questions? Contact us at <a href="mailto:support@lumina-destiny.com">support@lumina-destiny.com</a>
      </p>
      <p style="margin-top: 20px; font-size: 11px; color: rgba(255,255,255,0.4);">
        © ${new Date().getFullYear()} Lumina. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // 이메일 전송
    const data = await resend.emails.send({
      from: 'Lumina <noreply@luminadestiny.com>',
      to: [email],
      subject: `✨ Your Lumina Destiny Reading - ${element} ${animal}`,
      html: htmlContent,
      attachments: pdfBase64 ? [{
        filename: `Lumina_Destiny_${element}_${animal}.pdf`,
        content: pdfBase64,
      }] : []
    });

    return res.status(200).json({
      success: true,
      messageId: data.id
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to send email'
    });
  }
}
