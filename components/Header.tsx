import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogoIcon, QuestionMarkCircleIcon, HomeIcon, ClockIcon, UserIcon, MailIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from './icons';
import { Theme, User } from '../types';

const navLinks = [
  { to: '/', text: 'Dashboard', icon: HomeIcon },
  { to: '/history', text: 'History', icon: ClockIcon },
  { to: '/profile', text: 'Profile', icon: UserIcon },
  { to: '/contact', text: 'Contact Us', icon: MailIcon },
  { to: '/help', text: 'Help', icon: QuestionMarkCircleIcon },
];

const Header: React.FC<{ theme: Theme, setTheme: (theme: Theme) => void, user: User | null, onLogout: () => void }> = ({ theme, setTheme, user, onLogout }) => {
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'text-teal-500 bg-slate-100 dark:bg-slate-800'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  const handleThemeChange = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const ThemeIcon: React.FC = () => {
    if (theme === 'light') return <SunIcon className="h-5 w-5" />;
    if (theme === 'dark') return <MoonIcon className="h-5 w-5" />;
    return <ComputerDesktopIcon className="h-5 w-5" />;
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? "/" : "/welcome"} className="flex items-center space-x-3">
            <LogoIcon className="h-8 w-8 text-teal-500" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              DermaSight <span className="text-teal-500">AI</span>
            </h1>
          </Link>
          <div className="flex items-center space-x-4">
            {user && (
              <nav className="hidden md:flex items-center space-x-2">
                {navLinks.map(({ to, text, icon: Icon }) => (
                  <NavLink key={to} to={to} className={getNavLinkClass}>
                    <Icon className="h-5 w-5" />
                    <span>{text}</span>
                  </NavLink>
                ))}
              </nav>
            )}
            <button
              onClick={handleThemeChange}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-900"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
            >
              <ThemeIcon />
            </button>
            {user && (
              <button
                onClick={onLogout}
                className="py-1 px-4 text-sm font-semibold rounded-md transition-colors duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;