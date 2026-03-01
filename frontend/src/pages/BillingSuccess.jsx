/**
 * Billing Success Page
 * Handles payment success callbacks
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const BillingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    
    if (paymentId) {
      verifyPayment(paymentId);
    } else {
      setError('Payment ID not found');
      setPaymentStatus('error');
    }
  }, [searchParams]);

  const verifyPayment = async (paymentId) => {
    try {
      const response = await fetch(`/api/billing/payment/${paymentId}`);
      const data = await response.json();

      if (data.success) {
        setPaymentDetails(data);
        setPaymentStatus(data.status === 'success' ? 'success' : 'pending');
      } else {
        setError('Payment verification failed');
        setPaymentStatus('error');
      }
    } catch (err) {
      setError('Unable to verify payment status');
      setPaymentStatus('error');
    }
  };

  const renderContent = () => {
    switch (paymentStatus) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Verifying your payment...</h2>
            <p className="text-gray-600 mt-2">Please wait while we confirm your transaction.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your purchase. Your {paymentDetails?.transaction?.tier} subscription is now active.
            </p>
            
            {paymentDetails?.transaction && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Payment ID:</dt>
                    <dd className="font-mono text-sm">{paymentDetails.transaction.payment_id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Tier:</dt>
                    <dd className="capitalize">{paymentDetails.transaction.tier}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Amount:</dt>
                    <dd>{paymentDetails.transaction.amount} {paymentDetails.transaction.currency}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Email:</dt>
                    <dd>{paymentDetails.transaction.customer_email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Date:</dt>
                    <dd>{new Date(paymentDetails.transaction.created_at).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/billing/invoice'}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Download Invoice
              </button>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Processing</h2>
            <p className="text-lg text-gray-600 mb-6">
              Your payment is being processed. This may take a few minutes.
            </p>
            <p className="text-gray-600 mb-6">
              You will receive a confirmation email once the payment is complete.
            </p>
            
            {paymentDetails?.transaction && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Payment ID:</dt>
                    <dd className="font-mono text-sm">{paymentDetails.transaction.payment_id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Tier:</dt>
                    <dd className="capitalize">{paymentDetails.transaction.tier}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Amount:</dt>
                    <dd>{paymentDetails.transaction.amount} {paymentDetails.transaction.currency}</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Check Status Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h2>
            <p className="text-lg text-gray-600 mb-6">
              {error || 'There was an issue processing your payment.'}
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/billing/checkout'}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/support'}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default BillingSuccess;
