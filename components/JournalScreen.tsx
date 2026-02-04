import React, { useState } from 'react';
import { useAppStore } from '../store';
import type { JournalEntry } from '../types';

// =================================================================
// Sub-component: Journal Editor
// =================================================================
interface JournalEditorProps {
    entry: Partial<JournalEntry> | null;
    onSave: (entry: { id?: string; title: string; content: string }) => void;
    onCancel: () => void;
    onDelete?: (id: string) => void;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ entry, onSave, onCancel, onDelete }) => {
    const [title, setTitle] = useState(entry?.title || '');
    const [content, setContent] = useState(entry?.content || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSave = () => {
        if (title.trim()) {
            onSave({ id: entry?.id, title, content });
        }
    };

    const handleDelete = () => {
        if (entry?.id && onDelete) {
            onDelete(entry.id);
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-4 screen-enter-animation">
            <header className="flex-shrink-0 flex items-center justify-between pb-4">
                 <h1 className="text-3xl font-bold text-white drop-shadow-md">
                    {entry?.id ? 'تعديل تدوينة' : 'تدوينة جديدة'}
                </h1>
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-black/20 transition-colors" aria-label="إلغاء">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>
            
            <main className="flex-1 flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="عنوان التدوينة..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 text-lg bg-white/20 border-2 border-transparent rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-sky-300 focus:bg-white/30 transition-colors"
                />
                <textarea
                    placeholder="اكتبي ما في خاطرك..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full flex-1 px-4 py-3 bg-white/20 border-2 border-transparent rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-sky-300 focus:bg-white/30 transition-colors resize-none"
                />
            </main>

            <footer className="flex-shrink-0 pt-4 flex items-center justify-between gap-4">
                {entry?.id && onDelete && (
                    <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-rose-600/80 text-white font-semibold rounded-lg shadow-md transition-colors hover:bg-rose-700">
                        حذف
                    </button>
                )}
                <div className="flex-1"></div>
                <button onClick={handleSave} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg shadow-lg transition-colors hover:bg-blue-600 disabled:opacity-50" disabled={!title.trim()}>
                    حفظ التدوينة
                </button>
            </footer>

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-gray-800 animate-mood-card-enter">
                        <h2 className="text-xl font-bold mb-4">تأكيد الحذف</h2>
                        <p>هل أنتِ متأكدة من رغبتك في حذف هذه التدوينة؟ لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">إلغاء</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700">حذف</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// =================================================================
// Main Journal Screen Component
// =================================================================
export const JournalScreen: React.FC = () => {
    const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useAppStore(state => ({
        journalEntries: state.journalEntries,
        addJournalEntry: state.addJournalEntry,
        updateJournalEntry: state.updateJournalEntry,
        deleteJournalEntry: state.deleteJournalEntry,
    }));
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);

    const handleAddNew = () => {
        setCurrentEntry(null);
        setView('editor');
    };

    const handleSelectEntry = (entry: JournalEntry) => {
        setCurrentEntry(entry);
        setView('editor');
    };

    const handleSave = (entryData: { id?: string; title: string; content: string }) => {
        if (entryData.id) {
            // It's an update
            const originalEntry = journalEntries.find(e => e.id === entryData.id);
            if (originalEntry) {
                updateJournalEntry({ ...originalEntry, ...entryData });
            }
        } else {
            // It's a new entry
            addJournalEntry({ title: entryData.title, content: entryData.content });
        }
        setView('list');
        setCurrentEntry(null);
    };

    const handleDelete = (id: string) => {
        deleteJournalEntry(id);
        setView('list');
        setCurrentEntry(null);
    };

    const handleCancel = () => {
        setView('list');
        setCurrentEntry(null);
    };
    
    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (view === 'editor') {
        return <JournalEditor entry={currentEntry} onSave={handleSave} onCancel={handleCancel} onDelete={handleDelete} />;
    }

    // List View
    return (
        <div className="min-h-screen p-4 pb-24">
            <header className="pt-6 pb-4">
                <h1 className="text-4xl font-bold text-white drop-shadow-md">
                    المفكرة والتدوينات
                </h1>
            </header>

            <main className="mt-6 space-y-4">
                {journalEntries.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        <h3 className="mt-2 text-lg font-semibold text-white">ابدئي رحلة التدوين</h3>
                        <p className="mt-1 text-sm text-blue-200">دوني أفكارك ومشاعرك في مساحتك الخاصة.</p>
                    </div>
                ) : (
                    journalEntries.map(entry => (
                        <button key={entry.id} onClick={() => handleSelectEntry(entry)} className="w-full text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm transition-colors hover:bg-white/20 animate-mood-card-enter">
                            <h3 className="text-lg font-bold text-white">{entry.title}</h3>
                            <p className="text-xs text-blue-200 mb-2">آخر تحديث: {formatDate(entry.updatedAt)}</p>
                            <p className="text-sm text-blue-100/90 leading-relaxed line-clamp-2">{entry.content || 'لا يوجد محتوى...'}</p>
                        </button>
                    ))
                )}
            </main>
            
            <button 
                onClick={handleAddNew}
                aria-label="إضافة تدوينة جديدة"
                className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:shadow-xl z-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>
        </div>
    );
};