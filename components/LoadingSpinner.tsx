
import React from 'react';

const LoadingSpinner: React.FC = () => {
  const messages = [
    "Analyzing lesion morphology...",
    "Assessing dermatological patterns...",
    "Cross-referencing with clinical data...",
    "Calibrating confidence scores...",
    "Generating diagnostic insights..."
  ];
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2500);
    return () => clearInterval(interval);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-100/50 dark:bg-slate-800/50 rounded-lg p-8">
      <div className="w-16 h-16 border-4 border-t-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
      <p className="mt-6 text-slate-700 dark:text-slate-200 font-semibold text-lg text-center transition-opacity duration-500">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
