import React from 'react';
import { CHARACTERS } from '../constants';
import type { Character } from '../types';
import { useAppStore } from '../store';

const CharacterCard: React.FC<{ character: Character; onSelect: () => void }> = ({ character, onSelect }) => (
  <button
    onClick={onSelect}
    className="text-right w-full bg-gradient-to-br from-white to-slate-50 rounded-2xl p-5 shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:scale-105 hover:shadow-[0_15px_40px_rgba(25,118,210,0.2)] focus:outline-none focus:ring-2 focus:ring-sky-400"
  >
    <div className="flex items-start gap-4">
      <div className={`text-4xl p-3 rounded-full bg-gradient-to-br ${character.gradient} text-white shadow-md`}>
        {character.icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800">{character.name}</h3>
        <p className="text-sm font-semibold text-blue-600">{character.title}</p>
      </div>
    </div>
    <p className="mt-4 text-gray-600 text-sm">{character.description}</p>
  </button>
);


export const CharacterSelection: React.FC = () => {
  const selectCharacter = useAppStore((state) => state.selectCharacter);
  
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 pb-[150px]">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-md">اختاري من تثقين به اليوم</h1>
        <p className="mt-2 text-lg text-blue-100">كل شخصية هنا لتقدم لكِ الدعم بطريقتها الخاصة</p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {CHARACTERS.map((char) => (
          <CharacterCard key={char.id} character={char} onSelect={() => selectCharacter(char)} />
        ))}
      </main>
      <footer className="text-center mt-12 text-blue-200 text-sm">
        <p>مجتمع فضفضة نساء | خصوصيتك هي أولويتنا</p>
        <div className="mt-4 text-xs opacity-80">
          <p>المستكشف للتطوير و خدمات الرصد الاعلامي</p>
          <p>www.almstkshf.com</p>
          <p>المطورة ديانا قاسم</p>
        </div>
      </footer>
    </div>
  );
};