import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { requestPasswordReset, resetPassword } from '../services/authService';
import { Role } from '../types';

const ForgotPassword: React.FC = () => {
  const { role } = useParams<{ role: Role }>();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [resetCode, setResetCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [step, setStep] = React.useState<'request' | 'reset'>('request');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  if (!role || (role !== 'patient' && role !== 'doctor')) {
    return <div className="p-8 text-center text-red-500">Invalid role specified in URL.</div>;
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email, role);
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(email, resetCode, newPassword);
      navigate(`/${role}/login`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const title = `Reset Password - ${role.charAt(0).toUpperCase() + role.slice(1)} Portal`;

  return (
    <AuthLayout title={title}>
      {step === 'request' ? (
        <form className="space-y-6" onSubmit={handleRequestReset}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600"
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleResetPassword}>
          <div>
            <label htmlFor="resetCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Reset Code
            </label>
            <input
              id="resetCode"
              name="resetCode"
              type="text"
              required
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;