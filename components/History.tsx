import React, { useState, useEffect } from 'react';
import { DermaSightResponse, User } from '../types';
import { ClockIcon, FlagIcon } from './icons';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import * as caseService from '../services/caseService';

const HistoryCard: React.FC<{ record: DermaSightResponse; onClick: () => void; }> = ({ record, onClick }) => {
    const { patient_dashboard, doctor_dashboard, timestamp, imagePreviewUrl, isManuallyFlagged } = record;
    const riskScore = parseInt(doctor_dashboard.risk_score, 10);

    const getRiskScoreColor = (score: number) => {
        if (score > 70) return 'text-red-500';
        if (score > 40) return 'text-yellow-500';
        return 'text-green-500';
    }

    return (
        <button 
            onClick={onClick}
            className="w-full text-left bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex space-x-4 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500"
        >
             {imagePreviewUrl && (
                <div className="flex-shrink-0">
                    <img src={imagePreviewUrl} alt="Analysis thumbnail" className="h-24 w-24 object-cover rounded-md" />
                </div>
            )}
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2 min-w-0">
                        {isManuallyFlagged && <FlagIcon className="h-4 w-4 text-red-500 flex-shrink-0" aria-label="High-risk flag"/>}
                        <div className="min-w-0">
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{patient_dashboard.most_likely_disease}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Patient: {patient_dashboard.name}</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm text-slate-400 dark:text-slate-500">
                            {timestamp ? new Date(timestamp).toLocaleString() : 'Just now'}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
                            ID: {doctor_dashboard.case_id}
                        </p>
                    </div>
                </div>
                <div className="mt-2 flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Risk Score</span>
                        <p className={`text-2xl font-bold ${getRiskScoreColor(riskScore)}`}>{riskScore}</p>
                    </div>
                    <div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Priority</span>
                        <p className="font-bold text-slate-700 dark:text-slate-200 capitalize">{doctor_dashboard.priority_flag}</p>
                    </div>
                </div>
            </div>
        </button>
    );
};


const History: React.FC<{ history: DermaSightResponse[]; user: User | null }> = ({ history: initialHistory, user }) => {
    const [history, setHistory] = useState<DermaSightResponse[]>(initialHistory);
    const [selectedRecord, setSelectedRecord] = useState<DermaSightResponse | null>(null);

    useEffect(() => {
        setHistory(initialHistory);
    }, [initialHistory]);

    const handleToggleFlag = (caseId: string) => {
        let toggledCase: DermaSightResponse | undefined;
        const updatedCases = history.map(c => {
            if (c.doctor_dashboard.case_id === caseId) {
                const updatedCase = { ...c, isManuallyFlagged: !c.isManuallyFlagged };
                toggledCase = updatedCase;
                return updatedCase;
            }
            return c;
        });

        if (toggledCase) {
            caseService.updateCase(toggledCase);
            setHistory(updatedCases);
        }

        if (selectedRecord?.doctor_dashboard.case_id === caseId) {
            setSelectedRecord(prev => prev ? { ...prev, isManuallyFlagged: !prev.isManuallyFlagged } : null);
        }
    };

    const handleCloseModal = () => {
        setSelectedRecord(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">Analysis History</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                    {user?.role === 'doctor'
                        ? 'Review all patient cases and manage their status.'
                        : 'Review your past analyses and continue conversations with your doctor.'
                    }
                </p>
            </div>

            {history.length > 0 ? (
                <div className="space-y-6">
                    {history.map((record) => (
                        <HistoryCard key={record.doctor_dashboard.case_id} record={record} onClick={() => setSelectedRecord(record)} />
                    ))}
                </div>
            ) : (
                <div className="text-center bg-slate-100 dark:bg-slate-800/50 p-10 rounded-lg">
                    <ClockIcon className="h-16 w-16 mx-auto text-slate-400" />
                    <h2 className="mt-4 text-2xl font-bold text-slate-700 dark:text-slate-200">No History Yet</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        {user?.role === 'doctor'
                            ? 'No patient cases have been submitted to the system yet.'
                            : "Your analysis results will appear here once you've completed an analysis on the Dashboard page."
                        }
                    </p>
                </div>
            )}

            {selectedRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in-fast" role="dialog" aria-modal="true">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Analysis Details</h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500"
                                aria-label="Close details view"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-grow">
                            {user?.role === 'doctor' ? (
                                <DoctorDashboard caseData={selectedRecord} onToggleFlag={handleToggleFlag} />
                            ) : (
                                 <PatientDashboard data={selectedRecord.patient_dashboard} caseId={selectedRecord.doctor_dashboard.case_id} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;