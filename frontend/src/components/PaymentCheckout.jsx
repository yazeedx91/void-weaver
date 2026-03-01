"""
Payment Component with Mada Card Detection
React component for payment processing
"""

import React, { useState, useEffect } from 'react';
import { loadScript } from '../utils/scriptLoader';

const PaymentCheckout = ({ tier, customerEmail, customerName, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState('mada'); // Default to Mada for Saudi customers
  const [isSaudiCustomer, setIsSaudiCustomer] = useState(false);
  const [supportedCards, setSupportedCards] = useState([]);
  const [tierInfo, setTierInfo] = useState(null);
  const [error, setError] = useState('');

  // Detect Saudi customer and prioritize Mada
  useEffect(() => {
    const detectSaudiCustomer = () => {
      const saudiDomains = ['.sa', '.com.sa', '.org.sa', '.net.sa'];
      const isSaudi = saudiDomains.some(domain => customerEmail.toLowerCase().includes(domain));
      setIsSaudiCustomer(isSaudi);
      if (isSaudi) {
        setCardType('mada');
      }
    };

    detectSaudiCustomer();
    fetchSupportedCards();
    fetchTierInfo();
  }, [customerEmail, tier]);

  const fetchSupportedCards = async () => {
    try {
      const response = await fetch('/api/billing/card-types');
      const data = await response.json();
      if (data.success) {
        setSupportedCards(data.card_types);
      }
    } catch (err) {
      console.error('Error fetching supported cards:', err);
    }
  };

  const fetchTierInfo = async () => {
    try {
      const response = await fetch('/api/billing/tiers');
      const data = await response.json();
      if (data.success) {
        setTierInfo(data.tiers[tier]);
      }
    } catch (err) {
      console.error('Error fetching tier info:', err);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create checkout session
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          customerEmail,
          customerName,
          callbackUrl: `${window.location.origin}/billing/success`,
          webhookUrl: `${window.location.origin}/api/billing/webhook`
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Moyasar checkout
        window.location.href = data.checkout_url;
      } else {
        setError(data.error || 'Payment failed');
        onError(data.error || 'Payment failed');
      }
    } catch (err) {
      const errorMessage = 'Payment processing failed. Please try again.';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCardPriority = (card) => {
    if (isSaudiCustomer && card.saudi_priority) {
      return 'priority-saudi';
    }
    return `priority-${card.priority}`;
  };

  const renderCardLogos = () => {
    return supportedCards
      .sort((a, b) => {
        // Prioritize Mada for Saudi customers
        if (isSaudiCustomer) {
          if (a.saudi_priority && !b.saudi_priority) return -1;
          if (!a.saudi_priority && b.saudi_priority) return 1;
        }
        return a.priority - b.priority;
      })
      .map(card => (
        <div
          key={card.name}
          className={`card-logo ${getCardPriority(card)}`}
          title={card.name}
        >
          <img
            src={card.logo}
            alt={card.name}
            className={`w-12 h-8 object-contain ${card.saudi_priority && isSaudiCustomer ? 'ring-2 ring-green-500 rounded' : ''}`}
          />
          {card.saudi_priority && isSaudiCustomer && (
            <span className="text-xs text-green-600 font-semibold">Recommended</span>
          )}
        </div>
      ));
  };

  if (!tierInfo) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900">{tierInfo.description}</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {tierInfo.amount.toFixed(2)} {tierInfo.currency}
          </p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{customerEmail}</p>
            {isSaudiCustomer && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                🇸🇦 Saudi Customer
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900">{customerName}</p>
          </div>
        </div>
      </div>

      {/* Supported Cards */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Accepted Payment Methods
          {isSaudiCustomer && (
            <span className="ml-2 text-sm text-green-600">(Mada Recommended)</span>
          )}
        </h3>
        <div className="flex flex-wrap gap-3">
          {renderCardLogos()}
        </div>
        {isSaudiCustomer && (
          <p className="text-sm text-gray-600 mt-2">
            Mada cards are recommended for Saudi customers for faster processing and better rates.
          </p>
        )}
      </div>

      {/* Security Badge */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-700">
              Secure payment powered by Moyasar. Your payment information is encrypted and secure.
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Pay ${tierInfo.amount.toFixed(2)} ${tierInfo.currency}`
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center mt-4">
        By completing this purchase, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default PaymentCheckout;
