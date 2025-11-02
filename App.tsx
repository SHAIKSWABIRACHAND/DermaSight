import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DermaSightResponse, Theme, User } from './types';
import { analyzeSkinCondition } from './services/geminiService';
import * as authService from './services/authService';
import * as caseService from './services/caseService';

import Header from './components/Header';
import DoctorPortal from './components/DoctorPortal';
import LoadingSpinner from './components/LoadingSpinner';
import Help from './components/Help';
import History from './components/History';
import Profile from './components/Profile';
import Contact from './components/Contact';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import BatchResults from './components/BatchResults';
import CameraCapture from './components/CameraCapture';
import { CameraIcon } from './components/icons';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<DermaSightResponse[] | null>(null);
  const [history, setHistory] = useState<DermaSightResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser?.role === 'patient') {
      const allCases = caseService.getAllCases();
      const userHistory = allCases.filter(c => c.userEmail === currentUser.email);
      setHistory(userHistory);
    } else if (currentUser?.role === 'doctor') {
      const allCases = caseService.getAllCases();
      setHistory(allCases);
    } else {
      setHistory([]);
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    authService.saveCurrentUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    handleReset(); // Clear any analysis data
  };
  
  const handleProfileUpdate = async (updatedProfile: { name: string; email: string; }) => {
    if (!currentUser) throw new Error("Not logged in");
    try {
      const updatedUser = await authService.updateCurrentUser(currentUser.email, updatedProfile);
      setCurrentUser(updatedUser);
    } catch (err) {
      throw err;
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const oversizedFiles = newFiles.filter(file => file.size > 4 * 1024 * 1024); // 4MB limit
      if (oversizedFiles.length > 0) {
        setError(`Some files exceed the 4MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
        // Do not process any files if some are oversized to avoid confusion
        return;
      }
      
      setError(null);
      setImageFiles(newFiles);

      // Create previews
      const readerPromises = newFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readerPromises).then(previews => {
        setImagePreviews(previews);
      });
    }
  };

  const handleCapture = (file: File) => {
    const oversized = file.size > 4 * 1024 * 1024; // 4MB limit
    if (oversized) {
      setError(`Captured file exceeds the 4MB limit.`);
      return;
    }

    setError(null);
    const newFiles = [...imageFiles, file];
    setImageFiles(newFiles);

    // Create a new preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews(prev => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      mimeType: file.type,
      base64: await base64EncodedDataPromise,
    };
  };

  const handleAnalyze = useCallback(async () => {
    if (imageFiles.length === 0 || !currentUser) {
      setError("Please upload at least one image before analyzing.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResults(null);

    try {
        const newResults: DermaSightResponse[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const previewUrl = imagePreviews[i];

            const { base64, mimeType } = await fileToGenerativePart(file);
            const result = await analyzeSkinCondition({
                imageBase64: base64,
                mimeType,
                role: currentUser.role,
                patientName: `${currentUser.name} (Image ${i + 1}/${imageFiles.length})`,
                notes,
            });
            const resultWithExtras: DermaSightResponse = {
                ...result,
                timestamp: new Date().toISOString(),
                imagePreviewUrl: previewUrl,
                userEmail: currentUser.email,
            };
            newResults.push(resultWithExtras);

            // Save each case as it's processed
            if (currentUser.role === 'patient') {
                caseService.addCase(resultWithExtras);
            }
        }
        setAnalysisResults(newResults);
        setHistory(prev => [...newResults, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during the batch analysis.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [imageFiles, imagePreviews, currentUser, notes]);
  
  const handleReset = () => {
    setImageFiles([]);
    setImagePreviews([]);
    setNotes('');
    setAnalysisResults(null);
    setIsLoading(false);
    setError(null);
  };

  const AnalysisPage = () => {
    if (!currentUser || currentUser.role !== 'patient') return null;

    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                New Skin Analysis
              </h2>
              <button onClick={handleReset} className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">Start Over</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">1. Add Skin Image(s)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreviews.length > 0 ? (
                     <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {imagePreviews.map((src, index) => (
                           <img key={index} src={src} alt={`Preview ${index + 1}`} className="h-20 w-20 object-cover rounded-md" />
                        ))}
                    </div>
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
                      <span>Upload file(s)</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleImageChange} />
                    </label>
                    <p className="pl-1 inline">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF up to 4MB each</p>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                    <span className="flex-shrink mx-4 text-xs text-slate-400 dark:text-slate-500">OR</span>
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                  </div>

                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <CameraIcon className="h-5 w-5" />
                    <span>Use Camera</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">2. Batch Notes (Optional)</label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100"
                    placeholder="e.g., These images were taken at a health camp today."
                />
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={imageFiles.length === 0 || isLoading}
              className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Analyzing...' : `Analyze ${imageFiles.length > 0 ? imageFiles.length : ''} Image(s)`}
            </button>
          </div>

          <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl shadow-inner min-h-[400px] lg:min-h-0 flex flex-col justify-center">
            {isLoading ? <LoadingSpinner /> : 
             error ? (
              <div className="text-center p-8">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Analysis Failed</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-red-50 dark:bg-red-900/30 p-4 rounded-md">{error}</p>
                 <button onClick={handleAnalyze} className="mt-4 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700">Try Again</button>
              </div>
             ) : (
                <div className="text-center p-8">
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Awaiting Analysis</h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Add one or more images using the controls to start the AI-powered batch analysis.</p>
                </div>
             )
            }
          </div>
        </div>

        {analysisResults && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in-fast" role="dialog" aria-modal="true">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                    <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Batch Analysis Results</h2>
                        <button
                            onClick={handleReset}
                            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-teal-500"
                            aria-label="Close results and start over"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-grow">
                        <BatchResults results={analysisResults} />
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!currentUser) {
      return <Navigate to="/welcome" replace />;
    }
    return <>{children}</>;
  };
  
  return (
    <HashRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
          <Header theme={theme} setTheme={setTheme} user={currentUser} onLogout={handleLogout} />
          <main className="flex-grow flex flex-col">
            <Routes>
                {/* Public Routes */}
                <Route path="/welcome" element={<Landing />} />
                <Route path="/:role/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/:role/register" element={<Register onRegister={handleLogin} />} />
                <Route path="/:role/forgot-password" element={<ForgotPassword />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    {currentUser?.role === 'patient' ? <AnalysisPage /> : <DoctorPortal />}
                  </ProtectedRoute>
                } />
                <Route path="/history" element={<ProtectedRoute><History history={history} user={currentUser} /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile theme={theme} setTheme={setTheme} user={currentUser} onUpdateProfile={handleProfileUpdate} /></ProtectedRoute>} />
                <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
                
                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to={currentUser ? "/" : "/welcome"} replace />} />
            </Routes>
          </main>
          {isCameraOpen && <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
        </div>
    </HashRouter>
  );
};

export default App;