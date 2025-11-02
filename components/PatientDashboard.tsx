import React from 'react';
import { PatientDashboardData, DiseasePrediction } from '../types';
import { UserIcon, CheckCircleIcon, ExclamationTriangleIcon, LightbulbIcon } from './icons';
import Messaging from './Messaging';

const getSeverityColor = (severity: 'low' | 'moderate' | 'high') => {
  switch (severity) {
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }
};

const getRecommendationIcon = (recommendation: PatientDashboardData['recommendation']) => {
  switch (recommendation) {
    case 'self-care': return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    case 'monitor at home': return <LightbulbIcon className="h-6 w-6 text-yellow-500" />;
    case 'consult specialist': return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
    default: return null;
  }
};

const ProbabilityBar: React.FC<{ prediction: DiseasePrediction }> = ({ prediction }) => {
    const probabilityValue = parseInt(prediction.probability, 10);
    const barColor = probabilityValue > 60 ? 'bg-teal-500' : probabilityValue > 30 ? 'bg-yellow-500' : 'bg-slate-400';

    return (
        <div className="w-full">
            <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-slate-700 dark:text-slate-200">{prediction.disease}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{prediction.probability}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${probabilityValue}%` }}></div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{prediction.explanation}</p>
        </div>
    );
};

const PatientDashboard: React.FC<{ data: PatientDashboardData; caseId: string; }> = ({ data, caseId }) => {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex items-center space-x-4">
        <UserIcon className="h-12 w-12 text-teal-500"/>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hello, {data.name}</h2>
          <p className="text-slate-500 dark:text-slate-400">Here is your personalized skin analysis.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Possible Conditions</h3>
            <div className="space-y-4">
                {data.disease_predictions.map((pred, index) => (
                    <div key={index} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <ProbabilityBar prediction={pred} />
                         <div className="mt-3 flex items-center justify-between">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getSeverityColor(pred.severity)}`}>
                                {pred.severity.toUpperCase()} Severity
                            </span>
                            {pred.co_morbidity_flag && (
                               <div className="relative group flex items-center">
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 cursor-help">
                                        Co-morbidity Flag
                                    </span>
                                    <div
                                        className="absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 transform rounded-lg bg-slate-800 px-3 py-2 text-center text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none dark:bg-slate-700"
                                        role="tooltip"
                                    >
                                        This suggests a potential overlap or association with another condition. A dermatologist can provide a more accurate diagnosis.
                                        <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-800 dark:border-t-slate-700"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Most Likely Condition</h3>
                <p className="text-3xl font-bold text-teal-500 mt-2">{data.most_likely_disease}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Recommendation</h3>
                <div className="flex items-center space-x-3">
                    {getRecommendationIcon(data.recommendation)}
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 capitalize">{data.recommendation.replace(/_/g, ' ')}</p>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-2">{data.doctor_message}</p>
            </div>
        </div>
      </div>
       
      <Messaging caseId={caseId} currentUserRole="patient" />

       <div className={`p-4 rounded-lg flex items-center space-x-3 ${data.image_quality_feedback === 'good' ? 'bg-green-50 dark:bg-green-900/50' : 'bg-yellow-50 dark:bg-yellow-900/50'}`}>
            {data.image_quality_feedback === 'good' ? <CheckCircleIcon className="h-6 w-6 text-green-500" /> : <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />}
            <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Image Quality: <span className="capitalize">{data.image_quality_feedback}</span></h4>
                {data.image_quality_feedback !== 'good' && <p className="text-sm text-slate-600 dark:text-slate-300">For a more accurate analysis, consider retaking the photo in better light.</p>}
            </div>
        </div>
    </div>
  );
};

export default PatientDashboard;