import React, { useState, useEffect, useCallback, Component } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// 에러 바운더리
class PaymentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Payment component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ff6b6b' }}>
          <p>Payment loading error. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              background: '#d4af37',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// PayPal 설정
const PAYPAL_SANDBOX = true;
const PAYPAL_CLIENT_ID = PAYPAL_SANDBOX
  ? 'AZvUD5Okc-wujfd7j8NZqmhVorrKTfNEwPMA0hKQQ0gd3OK7aCSHb_uw8izQbCelkVNv4SVo6iIQ0dVS'
  : (import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AZA5M2uG97zvYefdfuPrNjWdi5ni5xdJkjZgm2azrUX0WWeQW46Zb1VrwZi_7sZrZf1rKs98LmEriFxM');

const MERCHANT_ID = import.meta.env.VITE_PAYPAL_MERCHANT_ID || '';

// API 엔드포인트
const API_BASE = '';

function PaymentButtonsInner({ email, onPaymentSuccess, onPaymentError }) {
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);
  const [googlePayClient, setGooglePayClient] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Apple Pay 가용성 체크
  useEffect(() => {
    try {
      // Apple Pay는 HTTPS에서만 작동 - HTTP에서는 DOMException 발생
      if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
        setApplePayAvailable(true);
      }
    } catch (err) {
      console.log('Apple Pay not available:', err.message);
    }
  }, []);

  // Google Pay 초기화 - 모바일 호환성 개선
  useEffect(() => {
    let mounted = true;

    const initGooglePay = async () => {
      try {
        // Google Pay API 존재 여부 확인
        if (typeof window === 'undefined') return;
        if (!window.google?.payments?.api?.PaymentsClient) {
          console.log('Google Pay API not loaded');
          return;
        }

        const client = new window.google.payments.api.PaymentsClient({
          environment: PAYPAL_SANDBOX ? 'TEST' : 'PRODUCTION'
        });

        const response = await client.isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
            }
          }]
        });

        if (mounted && response.result) {
          setGooglePayAvailable(true);
          setGooglePayClient(client);
        }
      } catch (err) {
        console.log('Google Pay init error:', err);
        // 에러나도 무시 - PayPal만 사용
      }
    };

    // Google Pay 스크립트 로드 시도
    const loadGooglePay = () => {
      try {
        // 이미 로드되어 있으면 바로 초기화
        if (window.google?.payments?.api?.PaymentsClient) {
          initGooglePay();
          return;
        }

        // 이미 스크립트가 있으면 스킵
        if (document.querySelector('script[src*="pay.google.com"]')) {
          // 로드 완료 대기
          const checkInterval = setInterval(() => {
            if (window.google?.payments?.api?.PaymentsClient) {
              clearInterval(checkInterval);
              initGooglePay();
            }
          }, 100);
          setTimeout(() => clearInterval(checkInterval), 5000);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://pay.google.com/gp/p/js/pay.js';
        script.async = true;
        script.onload = () => initGooglePay();
        script.onerror = () => console.log('Google Pay script failed to load');
        document.head.appendChild(script);
      } catch (err) {
        console.log('Google Pay load error:', err);
      }
    };

    // 약간의 지연 후 로드 (모바일 호환성)
    const timer = setTimeout(loadGooglePay, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // 결제 성공 처리
  const handlePaymentComplete = useCallback((details) => {
    // Meta Pixel 이벤트
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        value: 9.99,
        currency: 'USD',
        content_name: 'Lumina Destiny Reading',
        content_type: 'product'
      });
    }
    onPaymentSuccess(details);
  }, [onPaymentSuccess]);

  // Apple Pay 결제
  const handleApplePay = async () => {
    if (!window.ApplePaySession) return;

    setProcessing(true);

    try {
      const paymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD',
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'Lumina Destiny Reading',
          amount: '9.99'
        }
      };

      const session = new ApplePaySession(3, paymentRequest);

      session.onvalidatemerchant = async (event) => {
        try {
          const response = await fetch(`${API_BASE}/api/paypal/validate-merchant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              validationUrl: event.validationURL,
              displayName: 'Lumina Destiny'
            })
          });

          const merchantSession = await response.json();
          session.completeMerchantValidation(merchantSession);
        } catch (err) {
          console.error('Merchant validation failed:', err);
          session.abort();
          setProcessing(false);
          onPaymentError('Apple Pay merchant validation failed');
        }
      };

      session.onpaymentauthorized = async (event) => {
        try {
          // 1. 주문 생성
          const createResponse = await fetch(`${API_BASE}/api/paypal/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payment_source: {
                apple_pay: {
                  id: 'applepay_token',
                  stored_credential: { payment_initiator: 'CUSTOMER', payment_type: 'ONE_TIME' }
                }
              }
            })
          });

          const order = await createResponse.json();

          // 2. 결제 캡처
          const captureResponse = await fetch(`${API_BASE}/api/paypal/capture-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: order.id })
          });

          const captureData = await captureResponse.json();

          if (captureData.success) {
            session.completePayment(ApplePaySession.STATUS_SUCCESS);
            handlePaymentComplete(captureData);
          } else {
            session.completePayment(ApplePaySession.STATUS_FAILURE);
            onPaymentError('Apple Pay payment failed');
          }
        } catch (err) {
          console.error('Apple Pay error:', err);
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          onPaymentError('Apple Pay payment failed');
        }
        setProcessing(false);
      };

      session.oncancel = () => {
        setProcessing(false);
      };

      session.begin();

    } catch (err) {
      console.error('Apple Pay error:', err);
      setProcessing(false);
      onPaymentError('Apple Pay not available');
    }
  };

  // Google Pay 결제
  const handleGooglePay = async () => {
    if (!googlePayClient) return;

    setProcessing(true);

    try {
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'paypal',
              'paypal:merchant_id': MERCHANT_ID
            }
          }
        }],
        merchantInfo: {
          merchantId: MERCHANT_ID,
          merchantName: 'Lumina Destiny'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: '9.99',
          currencyCode: 'USD',
          countryCode: 'US'
        }
      };

      const paymentData = await googlePayClient.loadPaymentData(paymentDataRequest);

      // 1. 주문 생성
      const createResponse = await fetch(`${API_BASE}/api/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_source: {
            google_pay: {
              assurance_details: paymentData.paymentMethodData.info?.assuranceDetails
            }
          }
        })
      });

      const order = await createResponse.json();

      // 2. 결제 캡처
      const captureResponse = await fetch(`${API_BASE}/api/paypal/capture-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: order.id })
      });

      const captureData = await captureResponse.json();

      if (captureData.success) {
        handlePaymentComplete(captureData);
      } else {
        onPaymentError('Google Pay payment failed');
      }

    } catch (err) {
      console.error('Google Pay error:', err);
      if (err.statusCode !== 'CANCELED') {
        onPaymentError('Google Pay payment failed');
      }
    }

    setProcessing(false);
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    cursor: processing ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '10px',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Apple Pay 버튼 */}
      {applePayAvailable && (
        <button
          onClick={handleApplePay}
          disabled={processing}
          style={{
            ...buttonStyle,
            background: '#000',
            color: '#fff'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Pay with Apple Pay
        </button>
      )}

      {/* Google Pay 버튼 */}
      {googlePayAvailable && (
        <button
          onClick={handleGooglePay}
          disabled={processing}
          style={{
            ...buttonStyle,
            background: '#fff',
            color: '#3c4043',
            border: '1px solid #dadce0'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Pay with Google Pay
        </button>
      )}

      {/* 구분선 */}
      {(applePayAvailable || googlePayAvailable) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '15px 0',
          gap: '15px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>or pay with</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
        </div>
      )}

      {/* PayPal 버튼 */}
      <PayPalScriptProvider options={{
        "client-id": PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture"
      }}>
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "pay"
          }}
          disabled={processing}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: "9.99",
                  currency_code: "USD"
                },
                description: "Lumina Destiny Reading - Complete PDF Report (Launch Special)"
              }]
            });
          }}
          onApprove={(data, actions) => {
            setProcessing(true);
            return actions.order.capture()
              .then((details) => {
                // 검증
                if (!details || !details.purchase_units || !details.purchase_units[0]) {
                  throw new Error('Invalid response structure');
                }

                if (details.status !== 'COMPLETED') {
                  throw new Error('Order not completed: ' + details.status);
                }

                const captures = details.purchase_units[0].payments?.captures;
                if (!captures || captures.length === 0) {
                  throw new Error('No payment captured');
                }

                const allCapturesCompleted = captures.every(c => c.status === 'COMPLETED');
                if (!allCapturesCompleted) {
                  throw new Error('Payment capture failed');
                }

                const capturedAmount = parseFloat(captures[0].amount.value);
                if (capturedAmount !== 9.99) {
                  throw new Error('Incorrect amount');
                }

                handlePaymentComplete({
                  success: true,
                  orderID: details.id,
                  captureID: captures[0].id,
                  amount: capturedAmount,
                  payer: details.payer
                });
              })
              .catch((error) => {
                console.error('PayPal error:', error);
                onPaymentError(error.message || 'Payment failed');
              })
              .finally(() => {
                setProcessing(false);
              });
          }}
          onError={(err) => {
            console.error('PayPal Error:', err);
            onPaymentError('Payment failed. Please try again.');
          }}
        />
      </PayPalScriptProvider>

      {processing && (
        <div style={{
          textAlign: 'center',
          padding: '10px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '14px'
        }}>
          Processing payment...
        </div>
      )}
    </div>
  );
}

// 에러 바운더리로 감싼 export
export default function PaymentButtons(props) {
  return (
    <PaymentErrorBoundary>
      <PaymentButtonsInner {...props} />
    </PaymentErrorBoundary>
  );
}
