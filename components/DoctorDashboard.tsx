import React from 'react';
import { DermaSightResponse } from '../types';
import { ExclamationTriangleIcon, FlagIcon } from './icons';
import Messaging from './Messaging';

const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }
};

const getRiskScoreColor = (score: number) => {
    if (score > 70) return 'text-red-500';
    if (score > 40) return 'text-yellow-500';
    return 'text-green-500';
}

const InfoCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md h-full">
        <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
        {children}
    </div>
);

const RiskScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const colorClass = getRiskScoreColor(score);

    return (
        <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="absolute" width="144" height="144" viewBox="0 0 120 120">
                <circle
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-in-out`}
                    style={{ strokeDashoffset: offset }}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${colorClass}`}>{score}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">/ 100</span>
            </div>
        </div>
    );
};


const DoctorDashboard: React.FC<{ caseData: DermaSightResponse; onToggleFlag: (caseId: string) => void; }> = ({ caseData, onToggleFlag }) => {
  const data = caseData.doctor_dashboard;
  const riskScore = parseInt(data.risk_score, 10);

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Case ID: {data.case_id}</p>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">Clinical Summary</h2>
                </div>
                <div className="flex items-center space-x-4 flex-shrink-0">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${getPriorityColor(data.priority_flag)}`}>
                        {data.priority_flag.toUpperCase()} PRIORITY
                    </span>
                     <button
                        onClick={() => onToggleFlag(data.case_id)}
                        className={`flex items-center space-x-2 py-1 px-3 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
                            caseData.isManuallyFlagged
                            ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus-visible:ring-slate-500'
                        }`}
                        aria-label={caseData.isManuallyFlagged ? 'Unflag this case' : 'Flag this case as high risk'}
                    >
                        <FlagIcon className="h-4 w-4" />
                        <span>{caseData.isManuallyFlagged ? 'Unflag Case' : 'Flag Case'}</span>
                    </button>
                </div>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{data.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard title="Risk Score">
                <div className="flex items-center justify-center h-full">
                    <RiskScoreGauge score={riskScore} />
                </div>
            </InfoCard>

            <InfoCard title="Suggested Action">
                 <div className="flex flex-col justify-center h-full">
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">{data.action_suggestion.replace(/_/g, ' ')}</p>
                    {data.action_suggestion === 'high risk - immediate consult' && (
                        <div className="flex items-center space-x-2 mt-2 text-red-500">
                            <ExclamationTriangleIcon className="h-5 w-5"/>
                            <span>Immediate follow-up recommended.</span>
                        </div>
                    )}
                 </div>
            </InfoCard>

            <InfoCard title="Patient Alert">
                <div className="flex items-center h-full">
                    <p className="text-lg text-slate-600 dark:text-slate-300 italic">"{data.patient_alert}"</p>
                </div>
            </InfoCard>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Clinical Notes</h3>
             <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                <p>{data.clinical_notes}</p>
             </div>
        </div>

        <Messaging caseId={data.case_id} currentUserRole="doctor" />
    </div>
  );
};

export default DoctorDashboard;
