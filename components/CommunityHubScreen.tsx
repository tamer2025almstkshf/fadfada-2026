
import React, { useState } from 'react';

// Mock data for demonstration purposes
const mockConversations = [
  {
    id: 1,
    name: 'نورة',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    lastMessage: 'أهلاً! كيف حالك اليوم؟',
    time: '9:15 ص',
    unread: 2,
  },
  {
    id: 2,
    name: 'مجموعة الدعم',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
    lastMessage: 'فاطمة: شكراً جزيلاً على النصيحة!',
    time: '8:45 ص',
    unread: 0,
  },
  {
    id: 3,
    name: 'سارة',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
    lastMessage: 'بالتأكيد، سأكون هناك.',
    time: 'أمس',
    unread: 0,
  },
   {
    id: 4,
    name: 'هند',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a',
    lastMessage: 'وصلتني الصورة، رائعة!',
    time: 'أمس',
    unread: 1,
  },
];

// Define a type for a single conversation for better type safety
type Conversation = typeof mockConversations[0];

// Define a type for mock messages in the detail view
interface MockMessage {
    id: number;
    sender: 'me' | 'other';
    text: string;
    avatar: string;
}

// =================================================================
// Sub-component: Conversation Detail Screen
// =================================================================
const ConversationDetailScreen: React.FC<{ conversation: Conversation; onBack: () => void; }> = ({ conversation, onBack }) => {
    // Mock messages for this specific conversation
    const mockMessages: MockMessage[] = [
        { id: 1, sender: 'other', text: 'أهلاً! كيف حالك اليوم؟', avatar: conversation.avatar },
        { id: 2, sender: 'me', text: 'أهلاً نورة، أنا بخير الحمد لله. وأنتِ؟', avatar: 'https://i.pravatar.cc/150?u=me' },
        { id: 3, sender: 'other', text: 'بخير، شكراً لسؤالكِ!', avatar: conversation.avatar },
    ];

    return (
        <div className="min-h-screen flex flex-col screen-enter-animation">
            <header className="sticky top-0 flex items-center justify-between p-3 sm:p-4 bg-white/10 backdrop-blur-md shadow-md z-20">
                <div className="flex items-center gap-3">
                    <img src={conversation.avatar} alt={conversation.name} className="w-11 h-11 rounded-full object-cover" />
                    <div>
                        <h2 className="text-lg font-bold text-white">{conversation.name}</h2>
                        <p className="text-xs text-blue-100">نشطة الآن</p>
                    </div>
                </div>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-black/20 transition-colors" aria-label="العودة للمحادثات">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </header>
            <main className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                    {/* Mock messages display */}
                    {mockMessages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'other' && <img src={msg.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover self-end" />}
                            <div className={`p-3 shadow-md max-w-xs sm:max-w-sm md:max-w-md ${msg.sender === 'me' ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-t-2xl rounded-bl-2xl' : 'bg-white/90 text-gray-800 rounded-t-2xl rounded-br-2xl'}`}>
                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <div className="sticky bottom-0 z-10 bg-gradient-to-t from-sky-400 to-transparent pt-4 pb-2">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-end gap-2 p-1 bg-white/90 rounded-2xl shadow-xl backdrop-blur-sm border border-white/20">
                        <textarea placeholder="الرسائل معطلة في هذا العرض..." className="flex-1 bg-transparent p-3 text-gray-800 placeholder-gray-600 resize-none border-none focus:ring-0" rows={1} disabled />
                        <button disabled className="p-3 text-white rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 opacity-50 cursor-not-allowed">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// Sub-component: Conversation List Item
// =================================================================
interface ConversationListItemProps {
    conversation: Conversation;
    onClick: () => void;
}
const ConversationListItem: React.FC<ConversationListItemProps> = ({ conversation, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-3 text-right rounded-xl hover:bg-white/10 transition-colors duration-200">
        <div className="relative flex-shrink-0">
            <img src={conversation.avatar} alt={conversation.name} className="w-14 h-14 rounded-full object-cover" />
             {conversation.unread > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-2 border-slate-800">
                    {conversation.unread}
                </span>
            )}
        </div>
        <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-lg truncate">{conversation.name}</h3>
                <p className="text-xs text-blue-200 flex-shrink-0">{conversation.time}</p>
            </div>
            <p className="text-sm text-blue-100/80 truncate">{conversation.lastMessage}</p>
        </div>
    </button>
);


// =================================================================
// Fuzzy Search Helper
// =================================================================
// Calculates the Levenshtein distance between two strings, which is a
// measure of how different they are. A lower number means more similar.
const levenshteinDistance = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    const track = Array(s2.length + 1).fill(null).map(() =>
        Array(s1.length + 1).fill(null)
    );
    for (let i = 0; i <= s1.length; i += 1) {
       track[0][i] = i;
    }
    for (let j = 0; j <= s2.length; j += 1) {
       track[j][0] = j;
    }
    for (let j = 1; j <= s2.length; j += 1) {
       for (let i = 1; i <= s1.length; i += 1) {
          const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
          track[j][i] = Math.min(
             track[j][i - 1] + 1, // deletion
             track[j - 1][i] + 1, // insertion
             track[j - 1][i - 1] + indicator, // substitution
          );
       }
    }
    return track[s2.length][s1.length];
};

// =================================================================
// Main Component: Community Hub Screen
// =================================================================
export const CommunityHubScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    const filteredConversations = searchQuery.trim() === ''
    ? mockConversations
    : mockConversations.filter(convo => {
        const name = convo.name.toLowerCase();
        const query = searchQuery.toLowerCase().trim();
        
        if (!query) return true;

        // 1. Direct substring match (most common use case)
        if (name.includes(query)) {
          return true;
        }
        
        // 2. Fuzzy match for typos, active for queries > 2 chars to avoid noise
        if (query.length > 2) {
            const distance = levenshteinDistance(name, query);
            // A threshold of 2 allows for common typos
            if (distance <= 2) {
                return true;
            }
        }

        return false;
      });
    
    // If a conversation is selected, render the detail view
    if (selectedConversation) {
        return <ConversationDetailScreen conversation={selectedConversation} onBack={() => setSelectedConversation(null)} />
    }

    // Otherwise, render the list view
    return (
        <div className="min-h-screen flex flex-col p-4">
            <header className="pt-6 pb-4">
                <h1 className="text-4xl font-bold text-white drop-shadow-md mb-4">
                    المجتمع
                </h1>
                 <div className="relative">
                    <input 
                        type="text"
                        placeholder="بحث في المحادثات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border-2 border-transparent rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-sky-300 focus:bg-white/20 transition-colors"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto -mx-4 px-4">
                 <div className="space-y-2">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map(convo => (
                            <ConversationListItem 
                                key={convo.id} 
                                conversation={convo}
                                onClick={() => setSelectedConversation(convo)} 
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 text-blue-200">
                             <p>لا توجد نتائج تطابق بحثك.</p>
                        </div>
                    )}
                </div>
            </main>
            
            <button 
                aria-label="بدء محادثة جديدة"
                className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:shadow-xl z-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>
        </div>
    );
};
