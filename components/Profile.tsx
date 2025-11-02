import React, { useState, useEffect } from 'react';
import { UserIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from './icons';
import { Theme, User } from '../types';

interface ProfileProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User | null;
  onUpdateProfile: (profile: { name: string; email: string }) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ theme, setTheme, user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    if (!user || isSaving) return;
    setError(null);
    setIsSaving(true);
    try {
      if (profile.name.trim() === '' || profile.email.trim() === '') {
        throw new Error('Name and email cannot be empty.');
      }
      await onUpdateProfile(profile);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfile({ name: user.name, email: user.email });
    }
    setIsEditing(false);
    setError(null);
  };
  
  const ThemeButton: React.FC<{
    value: Theme;
    currentTheme: Theme;
    onClick: (theme: Theme) => void;
    children: React.ReactNode;
    label: string;
  }> = ({ value, currentTheme, onClick, children, label }) => (
    <button
      onClick={() => onClick(value)}
      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors duration-200 ${
        currentTheme === value ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/50' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
      aria-label={`Set theme to ${label}`}
      role="radio"
      aria-checked={currentTheme === value}
    >
      {children}
      <span className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
    </button>
  );

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">Loading user profile...</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    // Handles 'YYYY-MM-DD' by converting to local time to avoid timezone issues
    return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">User Profile</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Manage your personal information and application settings.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Details Card */}
        <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Profile Details</h2>
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="py-2 px-4 text-sm font-semibold rounded-md transition-colors duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="py-2 px-4 text-sm font-semibold rounded-md transition-colors duration-200 bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-400 dark:disabled:bg-teal-800 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="py-2 px-4 text-sm font-semibold rounded-md transition-colors duration-200 bg-teal-600 text-white hover:bg-teal-700"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <UserIcon className="h-24 w-24 text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full p-2" />
            </div>
            <div className="flex-grow w-full">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100 disabled:opacity-70"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{profile.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={isSaving}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-slate-800 dark:text-slate-100 disabled:opacity-70"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{profile.email}</p>
                  )}
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Role</label>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 capitalize">{user.role}</p>
                </div>

                {user.role === 'patient' && user.dateOfBirth && (
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Date of Birth</label>
                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{formatDate(user.dateOfBirth)}</p>
                    </div>
                )}
                {user.role === 'doctor' && user.licenseNumber && (
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Medical License</label>
                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{user.licenseNumber}</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Settings</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-semibold text-slate-600 dark:text-slate-300 mb-3">Appearance Theme</h3>
              <div role="radiogroup" aria-label="Theme selector" className="grid grid-cols-3 gap-4">
                <ThemeButton value="light" currentTheme={theme} onClick={setTheme} label="Light">
                    <SunIcon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                </ThemeButton>
                <ThemeButton value="dark" currentTheme={theme} onClick={setTheme} label="Dark">
                    <MoonIcon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                </ThemeButton>
                <ThemeButton value="system" currentTheme={theme} onClick={setTheme} label="System">
                    <ComputerDesktopIcon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                </ThemeButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;