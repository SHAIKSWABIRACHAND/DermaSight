import React from 'react';
import { LogoIcon } from './icons';
import { Link } from 'react-router-dom';

const AuthLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 py-12">
        <div>
          <Link to="/welcome" className="flex justify-center">
             <LogoIcon className="h-12 w-auto text-teal-500" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 space-y-6">
            {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
