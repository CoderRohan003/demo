'use client';

import { useState } from 'react';
import { account } from '@/lib/appwrite';
import Link from 'next/link';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // The URL must match the page you create in the next step
      const resetUrl = `${window.location.origin}/reset-password`;
      
      await account.createRecovery(email, resetUrl);
      setSuccess('If an account with this email exists, a password reset link has been sent.');
    } catch (err) {
      // For security, we show the same success message even if the email doesn't exist.
      // The error is only for developer debugging.
      console.error(err);
      setSuccess('If an account with this email exists, a password reset link has been sent.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-white">Forgot Password</h1>
      <p className="text-center text-gray-400">Enter your email address and we will send you a link to reset your password.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        
        {success && <p className="text-sm text-green-400 text-center">{success}</p>}
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading || !!success}
          className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <p className="text-sm text-center text-gray-400">
        Remember your password?{' '}
        <Link href="/login" legacyBehavior>
            <a className="font-medium text-blue-400 hover:underline">
                Login
            </a>
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;