import React, { useState, useEffect } from 'react';
import * as caseService from '../services/caseService';
import { DermaSightResponse } from '../types';
import DoctorDashboard from './DoctorDashboard';
import { ClockIcon, FlagIcon } from './icons';

const getPriorityClasses = (priority: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'low': return { bg: 'bg-green-100 dark:bg-green-900/70', text: 'text-green-800 dark:text-green-300', border: 'border-green-500' };
    case 'medium': return { bg: 'bg-yellow-100 dark:bg-yellow-900/70', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-500' };
    case 'high': return { bg: 'bg-red-100 dark:bg-red-900/70', text: 'text-red-800 dark:text-red-300', border: 'border-red-500' };
  }
};

const DoctorPortal: React.FC = () => {
  const [cases, setCases] = useState<DermaSightResponse[]>([]);
  const [displayedCases, setDisplayedCases] = useState<DermaSightResponse[]>([]);
  const [selectedCase, setSelectedCase] = useState<DermaSightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Sort State
  const [sortOption, setSortOption] = useState('date-desc');
  const [filterCondition, setFilterCondition] = useState('all');
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  const [uniqueConditions, setUniqueConditions] = useState<string[]>([]);

  useEffect(() => {
    const allCases = caseService.getAllCases();
    setCases(allCases);
    const conditions = [...new Set(allCases.map(c => c.patient_dashboard.most_likely_disease))];
    setUniqueConditions(conditions.sort());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let processedCases = [...cases];

    // 1. Apply Filters
    if (showOnlyFlagged) {
        processedCases = processedCases.filter(c => c.isManuallyFlagged);
    }
    if (filterCondition !== 'all') {
        processedCases = processedCases.filter(c => c.patient_dashboard.most_likely_disease === filterCondition);
    }

    // 2. Apply Sorting
    const priorityMap = { high: 3, medium: 2, low: 1 };
    processedCases.sort((a, b) => {
        // Manual flag always gets top priority in sorting
        if (a.isManuallyFlagged && !b.isManuallyFlagged) return -1;
        if (!a.isManuallyFlagged && b.isManuallyFlagged) return 1;

        switch (sortOption) {
            case 'risk-desc':
                return parseInt(b.doctor_dashboard.risk_score) - parseInt(a.doctor_dashboard.risk_score);
            case 'risk-asc':
                return parseInt(a.doctor_dashboard.risk_score) - parseInt(b.doctor_dashboard.risk_score);
            case 'priority-desc':
                return (priorityMap[b.doctor_dashboard.priority_flag] || 0) - (priorityMap[a.doctor_dashboard.priority_flag] || 0);
            case 'priority-asc':
                return (priorityMap[a.doctor_dashboard.priority_flag] || 0) - (priorityMap[b.doctor_dashboard.priority_flag] || 0);
            case 'date-asc':
                return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
            case 'date-desc':
            default:
                return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
        }
    });
    
    setDisplayedCases(processedCases);
    
    setSelectedCase(currentSelectedCase => {
        if (!currentSelectedCase || !processedCases.some(c => c.doctor_dashboard.case_id === currentSelectedCase.doctor_dashboard.case_id)) {
            return processedCases.length > 0 ? processedCases[0] : null;
        }
        return currentSelectedCase;
    });
  }, [cases, sortOption, filterCondition, showOnlyFlagged]);

  const handleToggleFlag = (caseId: string) => {
    const updatedCases = cases.map(c => {
        if (c.doctor_dashboard.case_id === caseId) {
            const updatedCase = { ...c, isManuallyFlagged: !c.isManuallyFlagged };
            caseService.updateCase(updatedCase);
            return updatedCase;
        }
        return c;
    });
    setCases(updatedCases);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-600 dark:text-slate-400">Loading doctor dashboard...</p>
      </div>
    );
  }

  const selectClasses = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md";

  return (
    <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6rem)]">
      {/* Case Notifications List */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col h-full">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          Case Notifications
        </h2>

        {/* Filter & Sort Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-4 flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="sort-cases" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Sort By</label>
                    <select id="sort-cases" value={sortOption} onChange={e => setSortOption(e.target.value)} className={selectClasses}>
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="priority-desc">Highest Priority</option>
                        <option value="priority-asc">Lowest Priority</option>
                        <option value="risk-desc">Highest Risk</option>
                        <option value="risk-asc">Lowest Risk</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="filter-condition" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Filter Condition</label>
                    <select id="filter-condition" value={filterCondition} onChange={e => setFilterCondition(e.target.value)} className={selectClasses}>
                        <option value="all">All Conditions</option>
                        {uniqueConditions.map(condition => <option key={condition} value={condition}>{condition}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                        <input id="filter-flagged" type="checkbox" checked={showOnlyFlagged} onChange={e => setShowOnlyFlagged(e.target.checked)} className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-slate-300 rounded"/>
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="filter-flagged" className="font-medium text-slate-700 dark:text-slate-200 cursor-pointer">Show only flagged cases</label>
                    </div>
                </div>
            </div>
        </div>

        <div className="overflow-y-auto">
          {displayedCases.length > 0 ? (
            displayedCases.map(c => {
              const priorityClasses = getPriorityClasses(c.doctor_dashboard.priority_flag);
              const isSelected = selectedCase?.doctor_dashboard.case_id === c.doctor_dashboard.case_id;

              return (
                <button
                  key={c.doctor_dashboard.case_id}
                  onClick={() => setSelectedCase(c)}
                  className={`w-full text-left p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 flex space-x-3 ${
                    isSelected ? `bg-teal-50 dark:bg-teal-900/40 border-r-4 ${priorityClasses.border}` : ''
                  }`}
                >
                  {c.imagePreviewUrl && (
                    <img src={c.imagePreviewUrl} alt="Case thumbnail" className="h-16 w-16 object-cover rounded-md flex-shrink-0" />
                  )}
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2 min-w-0">
                           {c.isManuallyFlagged && <FlagIcon className="h-4 w-4 text-red-500 flex-shrink-0" aria-label="High-risk flag"/>}
                            <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{c.patient_dashboard.name}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityClasses.bg} ${priorityClasses.text} flex-shrink-0`}>
                            {c.doctor_dashboard.priority_flag.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 truncate">{c.patient_dashboard.most_likely_disease}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {c.timestamp ? new Date(c.timestamp).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
              <ClockIcon className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="font-bold text-slate-700 dark:text-slate-200">No Matching Cases</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Adjust your filters or wait for new patient cases.</p>
            </div>
          )}
        </div>
      </div>

      {/* Case Details View */}
      <div className="lg:col-span-8 overflow-y-auto h-full pr-2 pb-4">
        {selectedCase ? (
          <div className="animate-fade-in">
            <DoctorDashboard caseData={selectedCase} onToggleFlag={handleToggleFlag} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <div className="text-center p-8">
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Select a Case</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Choose a case from the list to view the detailed analysis and communicate with the patient.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPortal;