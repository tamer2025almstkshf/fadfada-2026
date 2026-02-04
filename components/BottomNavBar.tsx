

import React from 'react';
import { useAppStore } from '../store';
import type { View } from '../types';

interface NavItemProps {
  view: View;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (view: View) => void;
  showNotificationDot?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ view, label, icon, isActive, onClick, showNotificationDot }) => (
  <button
    onClick={() => onClick(view)}
    className={`relative flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-300 ${isActive ? 'text-white' : 'text-blue-200 hover:text-white'}`}
    aria-current={isActive ? 'page' : undefined}
  >
    <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
      {icon}
    </div>
    <span className={`text-xs mt-1 font-semibold ${isActive ? 'opacity-100' : 'opacity-90'}`}>{label}</span>
    {showNotificationDot && (
        <span className="absolute top-1 right-1/2 translate-x-4 md:translate-x-6 block h-2.5 w-2.5 rounded-full bg-rose-400 border-2 border-white animate-pulse"></span>
    )}
  </button>
);

export const BottomNavBar: React.FC = () => {
  const { currentView, setView, dailyChallenge } = useAppStore(state => ({
    currentView: state.currentView,
    setView: state.setView,
    dailyChallenge: state.dailyChallenge,
  }));
  
  const showProfileNotification = !!(dailyChallenge && !dailyChallenge.completed);

  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    {
      view: 'aiChat',
      label: 'الدردشة',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      view: 'community',
      label: 'المجتمع',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.273-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.273.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      view: 'journal',
      label: 'المفكرة',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      view: 'profile',
      label: 'ملفي',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      view: 'settings',
      label: 'الإعدادات',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/20 backdrop-blur-lg border-t border-white/20 z-40">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map(item => (
          <NavItem 
            key={item.view}
            {...item}
            isActive={currentView === item.view}
            onClick={setView}
            showNotificationDot={item.view === 'profile' && showProfileNotification}
          />
        ))}
      </div>
    </nav>
  );
};