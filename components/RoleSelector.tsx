
import React from 'react';
import { Role } from '../types';
import { UserIcon, DoctorIcon } from './icons';

interface RoleSelectorProps {
  onSelectRole: (role: Role) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 sm:text-4xl">Welcome to DermaSight AI</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Please select your role to begin.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <button
          onClick={() => onSelectRole('patient')}
          className="group p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50"
        >
          <UserIcon className="h-16 w-16 mx-auto text-teal-500 group-hover:text-teal-400 transition-colors" />
          <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">I am a Patient</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Get a clear, understandable analysis of your skin condition.</p>
        </button>
        <button
          onClick={() => onSelectRole('doctor')}
          className="group p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <DoctorIcon className="h-16 w-16 mx-auto text-blue-500 group-hover:text-blue-400 transition-colors" />
          <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">I am a Doctor</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Access a detailed clinical dashboard for professional assessment.</p>
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;
