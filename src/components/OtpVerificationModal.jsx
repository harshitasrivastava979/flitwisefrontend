import React, { useState } from 'react';
import { sendSignupOtp, verifySignupOtp } from '../services/authService';

export default function OtpVerificationModal({ isOpen, email, onVerified, onClose }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (!isOpen) return null;

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await sendSignupOtp(email);
      setInfo('A new OTP has been sent to your email.');
    } catch (e) {
      setError(e.response?.data || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await verifySignupOtp(email, otp);
      onVerified?.();
    } catch (e) {
      setError(e.response?.data || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Verify your email</h3>
          <p className="text-sm text-gray-600">We sent a 6-digit code to {email}. Enter it below to continue.</p>
        </div>

        {error && (
          <div className="mb-3 p-2 rounded bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
        )}
        {info && (
          <div className="mb-3 p-2 rounded bg-green-50 text-green-700 border border-green-200 text-sm">{info}</div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className={`text-sm ${loading ? 'text-gray-400' : 'text-teal-600 hover:underline'}`}
            >
              Resend code
            </button>
            <div className="space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm rounded border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm rounded text-white ${loading ? 'bg-teal-300' : 'bg-teal-600 hover:bg-teal-700'}`}
              >
                Verify
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

 