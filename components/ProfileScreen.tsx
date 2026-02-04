

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import type { SavedChat, ChatMessage, JournalEntry } from '../types';
import { ACHIEVEMENTS } from '../constants';
import { generateWeeklySummary } from '../services/geminiService';

// =================================================================
// Sub-component: Weekly Summary Modal
// =================================================================
const WeeklySummaryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { savedChats, journalEntries } = useAppStore(state => ({
        savedChats: state.savedChats,
        journalEntries: state.journalEntries,
    }));
    
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Filter data for the last 7 days
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                const recentChats = savedChats.filter(c => new Date(c.savedAt) > oneWeekAgo);
                const recentEntries = journalEntries.filter(e => new Date(e.createdAt) > oneWeekAgo);

                const result = await generateWeeklySummary(recentChats, recentEntries);
                setSummary(result);
            } catch (err) {
                setError('حدث خطأ أثناء إنشاء الملخص. الرجاء المحاولة مرة أخرى.');
                console.error(err);
            }
            setIsLoading(false);
        };

        fetchSummary();
    }, [savedChats, journalEntries]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
            <div className="relative w-full max-w-md bg-gradient-to-br from-purple-800 to-indigo-900 border border-white/20 rounded-2xl shadow-2xl p-6 text-white animate-mood-card-enter" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-center">أفكارك الأسبوعية 💜</h2>
                <div className="min-h-[150px] bg-black/20 p-4 rounded-lg">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                           <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                        </div>
                    )}
                    {error && <p className="text-center text-red-300">{error}</p>}
                    {!isLoading && !error && (
                        <p className="text-center leading-relaxed whitespace-pre-wrap">{summary}</p>
                    )}
                </div>
                <button onClick={onClose} className="mt-6 w-full px-4 py-2 bg-white/20 font-semibold rounded-lg hover:bg-white/30">إغلاق</button>
            </div>
        </div>
    );
};

// =================================================================
// Sub-component: Chat Viewer
// =================================================================
const ChatViewer: React.FC<{ chat: SavedChat; onBack: () => void; }> = ({ chat, onBack }) => {
    const { fontSize, lineSpacing } = useAppStore(state => ({
        fontSize: state.fontSize,
        lineSpacing: state.lineSpacing
    }));
    const character = chat.character;

    const ReadOnlyBubble: React.FC<{message: ChatMessage}> = ({message}) => {
        const isUser = message.sender === 'user';
        return (
             <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                    <div className={`text-3xl p-2.5 h-11 w-11 flex items-center justify-center rounded-full bg-gradient-to-br ${character.gradient} shadow-md flex-shrink-0`}>
                        {character.icon}
                    </div>
                )}
                <div className={`p-3 shadow-md max-w-xs sm:max-w-sm md:max-w-md ${isUser ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-t-2xl rounded-bl-2xl' : 'bg-white/90 text-gray-800 rounded-t-2xl rounded-br-2xl'}`}>
                    {message.imageUrl && <img src={message.imageUrl} alt="مرفق" className="rounded-lg mb-2 max-h-60 w-full object-cover" />}
                    {message.text && <p className="whitespace-pre-wrap break-words" style={{ fontSize: `${fontSize}rem`, lineHeight: lineSpacing }}>{message.text}</p>}
                </div>
            </div>
        )
    };

    return (
        <div className="min-h-screen flex flex-col screen-enter-animation">
            <header className="sticky top-0 flex items-center justify-between p-3 sm:p-4 bg-white/10 backdrop-blur-md shadow-md z-20">
                <div className="flex items-center gap-3">
                    <div className={`text-3xl p-2 rounded-full bg-gradient-to-br ${character.gradient} shadow-md`}>
                        {character.icon}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{character.name}</h2>
                        <p className="text-xs text-blue-100">محادثة محفوظة</p>
                    </div>
                </div>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-black/20 transition-colors" aria-label="العودة للمحادثات المحفوظة">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                    </svg>
                </button>
            </header>
            <main className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                    {chat.chatHistory.map(msg => <ReadOnlyBubble key={msg.id} message={msg} />)}
                </div>
            </main>
        </div>
    );
};


// =================================================================
// Sub-component: Saved Chats List
// =================================================================
const SavedChatsList: React.FC<{ onSelectChat: (chat: SavedChat) => void; onBack: () => void; }> = ({ onSelectChat, onBack }) => {
    const { savedChats, deleteSavedChat } = useAppStore(state => ({
        savedChats: state.savedChats,
        deleteSavedChat: state.deleteSavedChat
    }));

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };
    
    return (
        <div className="min-h-screen p-4 screen-enter-animation">
            <header className="pt-6 pb-4 flex items-center justify-between">
                <h1 className="text-4xl font-bold text-white drop-shadow-md">
                    المحادثات المحفوظة
                </h1>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-black/20 transition-colors" aria-label="العودة للملف الشخصي">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </header>

            <main className="mt-6 space-y-4">
                {savedChats.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <h3 className="mt-2 text-lg font-semibold text-white">لا توجد محادثات محفوظة</h3>
                        <p className="mt-1 text-sm text-blue-200">يمكنك حفظ أي محادثة من الأيقونة في الأعلى!</p>
                    </div>
                ) : (
                    savedChats.map(chat => (
                        <div key={chat.id} className="group relative bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <button onClick={() => onSelectChat(chat)} className="w-full text-right">
                                <div className="flex items-start gap-4">
                                    <div className={`text-3xl p-3 flex-shrink-0 rounded-full bg-gradient-to-br ${chat.character.gradient} text-white shadow-md`}>
                                        {chat.character.icon}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="text-lg font-bold text-white">{chat.character.name}</h3>
                                        <p className="text-xs text-blue-200 mb-2">{formatDate(chat.savedAt)}</p>
                                        <p className="text-sm text-blue-100/90 leading-relaxed line-clamp-2">{chat.summary}</p>
                                    </div>
                                </div>
                            </button>
                             <button 
                                onClick={() => deleteSavedChat(chat.id)} 
                                aria-label="حذف المحادثة" 
                                className="absolute top-2 left-2 p-2 rounded-full bg-black/20 text-white transition-opacity opacity-0 group-hover:opacity-100 hover:bg-red-500/80">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

// =================================================================
// Sub-component: Achievements Screen
// =================================================================
const AchievementsScreen: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
    const unlockedAchievements = useAppStore(state => state.unlockedAchievements);

    return (
        <div className="min-h-screen p-4 screen-enter-animation">
            <header className="pt-6 pb-4 flex items-center justify-between">
                <h1 className="text-4xl font-bold text-white drop-shadow-md">
                    الإنجازات
                </h1>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-black/20 transition-colors" aria-label="العودة للملف الشخصي">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </header>

            <main className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ACHIEVEMENTS.map(achievement => {
                    const isUnlocked = unlockedAchievements.includes(achievement.id);
                    return (
                        <div key={achievement.id} className={`relative p-4 text-center rounded-2xl transition-all duration-300 ${
                            isUnlocked 
                            ? 'bg-gradient-to-br from-white/20 to-white/10 shadow-xl border border-yellow-300/50' 
                            : 'bg-white/10 opacity-60'
                        }`}>
                            <div className={`mb-2 transition-transform duration-500 ease-out ${
                                isUnlocked 
                                ? 'text-6xl scale-110 drop-shadow-[0_4px_8px_rgba(252,211,77,0.4)]' 
                                : 'text-5xl filter grayscale'
                            }`}>
                                {achievement.icon}
                            </div>
                            <h3 className="font-bold text-white text-md">{achievement.name}</h3>
                            <p className="text-xs text-blue-200">{achievement.description}</p>
                            {!isUnlocked && (
                                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </main>
        </div>
    );
};


// =================================================================
// Main Profile Screen Component (Router)
// =================================================================
export const ProfileScreen: React.FC = () => {
    const { currentUser, logout, dailyChallenge, completeDailyChallenge } = useAppStore(state => ({
        currentUser: state.currentUser,
        logout: state.logout,
        dailyChallenge: state.dailyChallenge,
        completeDailyChallenge: state.completeDailyChallenge,
    }));

    const [subView, setSubView] = useState<'main' | 'list' | 'viewer' | 'achievements'>('main');
    const [viewingChat, setViewingChat] = useState<SavedChat | null>(null);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    const handleViewList = () => setSubView('list');
    const handleViewAchievements = () => setSubView('achievements');
    const handleViewChat = (chat: SavedChat) => {
        setViewingChat(chat);
        setSubView('viewer');
    };
    const handleBackToList = () => {
        setViewingChat(null);
        setSubView('list');
    };
    const handleBackToMain = () => setSubView('main');

    const handleEditProfile = () => {
        alert("ميزة تعديل الملف الشخصي قيد التطوير حالياً.");
    };
    
    // Render sub-views based on state
    if (subView === 'list') {
        return <SavedChatsList onSelectChat={handleViewChat} onBack={handleBackToMain} />;
    }
    if (subView === 'achievements') {
        return <AchievementsScreen onBack={handleBackToMain} />;
    }
    if (subView === 'viewer' && viewingChat) {
        return <ChatViewer chat={viewingChat} onBack={handleBackToList} />;
    }

    // Default 'main' view
    const ProfileOption: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
        <button onClick={onClick} className="w-full flex items-center gap-4 text-lg text-white bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-colors duration-200">
            <div className="text-blue-200">{icon}</div>
            <span>{label}</span>
            <div className="mr-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </div>
        </button>
    );

    return (
        <div className="min-h-screen flex flex-col items-center p-4 pt-10">
            {showSummaryModal && <WeeklySummaryModal onClose={() => setShowSummaryModal(false)} />}
            <div className="bg-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-md max-w-md w-full">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative mb-4">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-300 to-blue-500 flex items-center justify-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                    {currentUser && (
                        <>
                            <h1 className="text-2xl font-bold text-white drop-shadow-md">
                                {currentUser.name}
                            </h1>
                            <p className="text-md text-blue-200">
                                {currentUser.email}
                            </p>
                        </>
                    )}
                </div>

                {dailyChallenge && (
                    <div className="mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                        <h3 className="font-bold text-white">🌟 تحدي اليوم للعناية بالذات</h3>
                        <p className="text-purple-200 my-2">{dailyChallenge.text}</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={dailyChallenge.completed}
                                onChange={completeDailyChallenge}
                                className="w-5 h-5 rounded text-pink-500 bg-white/30 border-white/50 focus:ring-pink-500"
                            />
                            <span className={`text-sm font-semibold transition-all ${dailyChallenge.completed ? 'text-white line-through animate-challenge-complete' : 'text-purple-100'}`}>
                                {dailyChallenge.completed ? 'أحسنتِ!' : 'أكملت التحدي'}
                            </span>
                        </label>
                    </div>
                )}


                <div className="space-y-4">
                    <ProfileOption
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                        label="أفكاري الأسبوعية"
                        onClick={() => setShowSummaryModal(true)}
                    />
                    <ProfileOption
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>}
                        label="تعديل الملف الشخصي"
                        onClick={handleEditProfile}
                    />
                     <ProfileOption
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>}
                        label="المحادثات المحفوظة"
                        onClick={handleViewList}
                    />
                    <ProfileOption
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                        label="الإنجازات"
                        onClick={handleViewAchievements}
                    />
                </div>

                <button
                    onClick={logout}
                    className="mt-10 w-full flex items-center justify-center gap-3 bg-rose-500/80 text-white font-bold text-lg rounded-full px-8 py-3 shadow-xl transition-all duration-300 ease-in-out hover:bg-rose-600 hover:-translate-y-1 transform"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </div>
    );
};