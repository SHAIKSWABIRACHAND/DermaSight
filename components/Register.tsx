import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { register } from '../services/authService';
import { verifyLicense } from '../services/licenseService';
import { Role, User } from '../types';

interface RegisterProps {
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const { role } = useParams<{ role: Role }>();
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [licenseNumber, setLicenseNumber] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'verifying' | 'registering'>('idle');
  
  if (!role || (role !== 'patient' && role !== 'doctor')) {
    return <div className="p-8 text-center text-red-500">Invalid role specified in URL.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);

    try {
      if (role === 'doctor') {
        if (!licenseNumber.trim()) {
            throw new Error("Medical license number is required for doctors.");
        }
        setStatus('verifying');
        const isLicenseValid = await verifyLicense(licenseNumber);
        if (!isLicenseValid) {
          throw new Error("The provided medical license number could not be verified. Please check the number and try again.");
        }
      }
      
      setStatus('registering');
      const user = await register(name, email, password, role, licenseNumber, dateOfBirth);
      onRegister(user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setStatus('idle');
    }
  };
  
  const getButtonText = () => {
    if (status === 'verifying') return 'Verifying License...';
    if (status === 'registering') return 'Creating Account...';
    return 'Create Account';
  }

  const title = `Create a ${role} account`;

  return (
    <AuthLayout title={title}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
            <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100" />
        </div>
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100" />
        </div>
        {role === 'patient' && (
            <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                <input id="dateOfBirth" name="dateOfBirth" type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100" />
            </div>
        )}
        {role === 'doctor' && (
            <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Medical License Number</label>
                <input id="licenseNumber" name="licenseNumber" type="text" required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100" />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Your license will be verified. (For demo, try: <code className="font-mono">DOC12345</code> or <code className="font-mono">MD67890</code>)
                </p>
            </div>
        )}
        <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100" />
        </div>
        <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
            <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100" />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        
        <div>
          <button type="submit" disabled={status !== 'idle'} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-wait">
            {getButtonText()}
          </button>
        </div>
      </form>
       <div className="text-sm text-center">
        <Link to={`/${role}/login`} className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">
          Already have an account? Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
