import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, DoctorIcon } from './icons';

const Landing: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 sm:text-5xl">
          Welcome to DermaSight AI
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">
          Your advanced AI Dermatology Assistant.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <Link
          to="/patient/login"
          className="group p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50"
        >
          <UserIcon className="h-16 w-16 mx-auto text-teal-500 group-hover:text-teal-400 transition-colors" />
          <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white text-center">Patient Portal</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-center">
            Log in or sign up to analyze a skin condition.
          </p>
        </Link>
        <Link
          to="/doctor/login"
          className="group p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <DoctorIcon className="h-16 w-16 mx-auto text-blue-500 group-hover:text-blue-400 transition-colors" />
          <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white text-center">Doctor Portal</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-center">
            Access the clinical dashboard for patient assessment.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Landing;
