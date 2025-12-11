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

  // 하드코딩 사용 (Private 저장소)
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_6FLRsWBX_FbFkvHBbwWtQqMpf5ijCDQUV';

  // 디버깅: 환경변수 확인
  const debugInfo = {
    hasKey: !!RESEND_API_KEY,
    keyLength: RESEND_API_KEY?.length || 0,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('RESEND') || k.includes('API')),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  };

  console.log('🔍 [DEBUG] Environment variables check:', debugInfo);

  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not configured!');
    return res.status(500).json({
      error: 'Resend API key not configured',
      debug: debugInfo
    });
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
      <h1>LUMINA</h1>
      <p>Analysis Report Delivery</p>
    </div>

    <div class="content">
      <div class="greeting">
        Hello,
      </div>

      <p style="line-height: 1.6; color: rgba(255,255,255,0.9);">
        Here is the PDF report you purchased. Your personalized analysis is attached to this email.
      </p>

      <div class="result-box">
        <h2 style="margin-top: 0; color: #daa520; font-size: 20px;">Order Information</h2>
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
        The PDF file is attached to this email. Contents:
      </p>

      <ul style="line-height: 1.8; color: rgba(255,255,255,0.8);">
        <li>Personality analysis</li>
        <li>Career guidance</li>
        <li>Financial insights</li>
        <li>Relationship compatibility</li>
        <li>Health recommendations</li>
        <li>Annual forecasts</li>
      </ul>

      <p style="line-height: 1.6; color: rgba(255,255,255,0.9); margin-top: 25px;">
        If you have any questions, please contact our support team.
      </p>
    </div>

    <div class="footer">
      <p>
        Thank you for your purchase.
      </p>
      <p style="margin-top: 15px;">
        Support: <a href="mailto:support@luminadestiny.com">support@luminadestiny.com</a>
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
      subject: 'Delivery: Your Analysis Report (PDF)',
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
