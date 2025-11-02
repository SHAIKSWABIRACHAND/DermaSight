import React, { useState } from 'react';
import { DermaSightResponse } from '../types';
import PatientDashboard from './PatientDashboard';

const ResultCard: React.FC<{ result: DermaSightResponse; onViewDetails: () => void }> = ({ result, onViewDetails }) => {
    const { patient_dashboard, doctor_dashboard, imagePreviewUrl } = result;
    const riskScore = parseInt(doctor_dashboard.risk_score, 10);

    const getRiskScoreColor = (score: number) => {
        if (score > 70) return 'text-red-500';
        if (score > 40) return 'text-yellow-500';
        return 'text-green-500';
    };

     const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }
    };


    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden flex flex-col">
            <img src={imagePreviewUrl} alt="Analyzed skin condition" className="w-full h-32 object-cover" />
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate pr-2">{patient_dashboard.most_likely_disease}</h4>
                     <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getPriorityColor(doctor_dashboard.priority_flag)}`}>
                        {doctor_dashboard.priority_flag}
                    </span>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 flex-grow">{patient_dashboard.name}</p>

                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Risk Score</span>
                        <p className={`text-xl font-bold ${getRiskScoreColor(riskScore)}`}>{riskScore}</p>
                    </div>
                    <button
                        onClick={onViewDetails}
                        className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

const BatchResults: React.FC<{ results: DermaSightResponse[] }> = ({ results }) => {
    const [selectedResult, setSelectedResult] = useState<DermaSightResponse | null>(null);

    const handleCloseModal = () => {
        setSelectedResult(null);
    };

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col animate-fade-in">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 text-center">
                Batch Analysis Complete
            </h3>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
                {results.length} image(s) processed successfully.
            </p>
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((res) => (
                        <ResultCard
                            key={res.doctor_dashboard.case_id}
                            result={res}
                            onViewDetails={() => setSelectedResult(res)}
                        />
                    ))}
                </div>
            </div>

            {selectedResult && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in-fast" role="dialog" aria-modal="true">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Analysis Details</h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                aria-label="Close details view"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-grow">
                             <PatientDashboard data={selectedResult.patient_dashboard} caseId={selectedResult.doctor_dashboard.case_id} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchResults;
