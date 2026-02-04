import React from 'react';
import { MOODS } from '../constants';
import type { Mood } from '../types';
import { useAppStore } from '../store';

const MoodCard: React.FC<{ mood: Mood; onSelect: () => void, delay: number }> = ({ mood, onSelect, delay }) => (
  <button
    onClick={onSelect}
    className="opacity-0 flex flex-col items-center justify-center gap-2 w-32 h-32 bg-white/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-sky-400 animate-mood-card-enter"
    style={{ animationDelay: `${delay}ms`}}
  >
    <span className="text-5xl">{mood.icon}</span>
    <span className="font-bold text-white text-md">{mood.name}</span>
  </button>
);

export const MoodCheckinScreen: React.FC = () => {
  const startChatting = useAppStore((state) => state.startChatting);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 pb-[150px] text-center">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-white drop-shadow-md">كيف تشعرين اليوم؟</h1>
        <p className="mt-2 text-lg text-blue-100">اختيارك يساعدنا على فهمك بشكل أفضل</p>
      </header>
      <main className="flex flex-wrap justify-center items-center gap-4">
        {MOODS.map((mood, index) => (
          <MoodCard 
            key={mood.id} 
            mood={mood} 
            onSelect={() => startChatting(mood)}
            delay={index * 100} 
          />
        ))}
      </main>
      <footer className="mt-12">
        <button
          onClick={() => startChatting()}
          className="text-blue-200 text-sm hover:text-white hover:underline transition-colors"
        >
          تخطي
        </button>
      </footer>
    </div>
  );
};