
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { Screen, Character, ChatMessage, Mood, View, User, SavedChat, JournalEntry, Achievement } from './types';
import { 
    getAiStreamedResponse, 
    generateMoodAwareWelcomeMessage, 
    generateChatSummary,
    generateDailyChallenge,
} from './services/geminiService';
import { LOCAL_STORAGE_KEYS, DEFAULT_THEME_ID, ACHIEVEMENTS } from './constants';

interface AppState {
  // AI Chat flow state
  currentScreen: Screen;
  selectedCharacter: Character | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  currentMood: Mood | null;
  
  // Main App state
  isAuthenticated: boolean;
  currentUser: User | null;
  currentView: View;
  savedChats: SavedChat[];
  journalEntries: JournalEntry[];

  // Accessibility & Appearance Settings
  fontSize: number;
  lineSpacing: number;
  activeThemeId: string;

  // Gamification & Engagement
  onboardingCompleted: boolean;
  unlockedAchievements: string[];
  dailyStreak: { count: number; lastVisit: string }; // YYYY-MM-DD
  dailyChallenge: { id: string; text: string; completed: boolean; date: string } | null;
  completedChallengeDates: string[];
  lastUnlockedAchievement: Achievement | null; // For in-app notification
}

interface AppActions {
  // Auth actions
  login: () => void; // Mock login
  logout: () => void;

  // Navigation actions
  setView: (view: View) => void;

  // AI Chat flow actions
  goToSelectionScreen: () => void;
  selectCharacter: (character: Character) => void;
  startChatting: (mood?: Mood) => Promise<void>;
  goBack: () => void;
  sendMessage: (message: { text: string; imageUrl?: string }) => Promise<void>;
  addAiMessage: (message: { id: string; text: string; isStreaming?: boolean }) => void;
  retryMessage: (messageId: string) => Promise<void>;
  editUserMessage: (messageId: string, newText: string) => Promise<void>;
  saveCurrentChat: () => Promise<boolean>;
  deleteSavedChat: (chatId: string) => void;
  
  // Journal actions
  addJournalEntry: (entry: { title: string; content: string }) => void;
  updateJournalEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (entryId: string) => void;

  // Settings actions
  setFontSize: (size: number) => void;
  setLineSpacing: (spacing: number) => void;
  setTheme: (themeId: string) => void;
  
  // Engagement actions
  completeOnboarding: () => void;
  completeDailyChallenge: () => void;

  // Achievement actions
  checkAchievements: () => void;
  dismissAchievementNotification: () => void;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState & AppActions>()(
  persist(
    immer((set, get) => ({
      // Initial State
      currentScreen: 'welcome',
      selectedCharacter: null,
      chatHistory: [],
      isLoading: false,
      currentMood: null,

      isAuthenticated: false,
      currentUser: null,
      currentView: 'aiChat',
      savedChats: [],
      journalEntries: [],
      
      fontSize: 1,
      lineSpacing: 1.6,
      activeThemeId: DEFAULT_THEME_ID,

      onboardingCompleted: false,
      unlockedAchievements: [],
      dailyStreak: { count: 0, lastVisit: '' },
      dailyChallenge: null,
      completedChallengeDates: [],
      lastUnlockedAchievement: null;


      // Actions
      login: () => {
        // Mock login. In a real app, this would involve an API call.
        const today = getTodayDateString();
        const { dailyStreak, dailyChallenge } = get();
        
        // Handle Daily Streak Logic
        if (dailyStreak.lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];
            
            if (dailyStreak.lastVisit === yesterdayString) {
                // Consecutive day
                set(state => { state.dailyStreak.count += 1; });
            } else {
                // Streak is broken
                set(state => { state.dailyStreak.count = 1; });
            }
            set(state => { state.dailyStreak.lastVisit = today; });
        }
        
        // Handle Daily Challenge Logic
        if (!dailyChallenge || dailyChallenge.date !== today) {
            // Generate a new challenge in the background, don't block login
            generateDailyChallenge().then(text => {
                set(state => {
                    state.dailyChallenge = {
                        id: `challenge-${today}`,
                        text,
                        completed: false,
                        date: today,
                    };
                });
            }).catch(e => console.error("Failed to generate daily challenge", e));
        }

        set({
          isAuthenticated: true,
          currentUser: { id: '1', name: 'ديانا', email: 'diana@example.com' },
          currentScreen: 'welcome', // Start the AI chat flow
          currentView: 'aiChat',
        });
        
        get().checkAchievements();
      },

      logout: () => {
        set({
          isAuthenticated: false,
          currentUser: null,
          currentScreen: 'welcome',
          selectedCharacter: null,
          chatHistory: [],
          isLoading: false,
          currentMood: null,
          currentView: 'aiChat',
        });
      },

      setView: (view) => {
        set({ currentView: view });
        get().checkAchievements();
      },

      goToSelectionScreen: () => {
        set({ currentScreen: 'selection' });
      },

      selectCharacter: (character) => {
        set({
          selectedCharacter: character,
          currentScreen: 'moodCheckin',
          chatHistory: [],
          isLoading: false,
          currentMood: null,
        });
      },

      startChatting: async (mood) => {
        const { selectedCharacter } = get();
        if (!selectedCharacter) return;

        set({
          currentScreen: 'chat',
          isLoading: true,
          currentMood: mood || null,
          chatHistory: [], // Start with empty history, welcome message comes after generation
        });
        
        let welcomeMessage = selectedCharacter.welcomeMessage;
        
        if (mood) {
            try {
                welcomeMessage = await generateMoodAwareWelcomeMessage(selectedCharacter, mood);
            } catch (error) {
                console.error("Could not generate mood-aware message, falling back to default.", error);
            }
        }
        
        set(state => {
            state.chatHistory.push({
                id: 'welcome-message',
                sender: 'ai',
                text: welcomeMessage,
                character: selectedCharacter,
            });
            state.isLoading = false;
        });
      },

      goBack: () => {
        const { currentScreen } = get();
        if (currentScreen === 'chat') {
            set({ currentScreen: 'selection', chatHistory: [], selectedCharacter: null, currentMood: null });
        } else if (currentScreen === 'moodCheckin') {
            set({ currentScreen: 'selection' });
        } else if (currentScreen === 'selection') {
            set({ currentScreen: 'welcome' });
        }
      },

      sendMessage: async (message) => {
        const { selectedCharacter, currentMood } = get();
        if (!selectedCharacter) return;
        
        if (!message.text.trim() && !message.imageUrl) {
            return;
        }

        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'user',
          text: message.text,
          imageUrl: message.imageUrl,
        };

        set(state => {
          state.chatHistory.push(userMessage);
          state.isLoading = true;
        });

        try {
          const stream = await getAiStreamedResponse(
            selectedCharacter, 
            currentMood, 
            get().chatHistory
          );

          let accumulatedText = '';
          let isNewMessage = true;
          const aiMessageId = `ai-${Date.now()}`;

          for await (const chunk of stream) {
            accumulatedText += chunk.text;
            
            if (isNewMessage) {
              isNewMessage = false;
              set(state => {
                state.chatHistory.push({
                  id: aiMessageId,
                  sender: 'ai',
                  text: accumulatedText,
                  character: selectedCharacter,
                  isStreaming: true,
                });
              });
            } else {
              set(state => {
                const lastMessage = state.chatHistory[state.chatHistory.length - 1];
                if (lastMessage?.id === aiMessageId) {
                  lastMessage.text = accumulatedText;
                }
              });
            }
          }
          
          set(state => {
            const lastMessage = state.chatHistory[state.chatHistory.length - 1];
            if (lastMessage?.id === aiMessageId) {
              lastMessage.isStreaming = false;
            }
            state.isLoading = false;
          });

        } catch (error) {
          console.error(error);
          set(state => {
            const failedMessage = state.chatHistory.find(m => m.id === userMessage.id);
            if (failedMessage) {
              failedMessage.status = 'failed';
            }
            state.isLoading = false;
          });
        }
      },
      
      retryMessage: async (messageId: string) => {
        const { selectedCharacter, currentMood, chatHistory } = get();
        const messageToRetry = chatHistory.find(m => m.id === messageId);

        if (!selectedCharacter || !messageToRetry) return;

        set(state => {
            const msg = state.chatHistory.find(m => m.id === messageId);
            if (msg) {
                delete msg.status;
            }
            state.isLoading = true;
        });

        try {
            const historyForRetry = get().chatHistory.filter(m => m.id !== messageId);
            historyForRetry.push(messageToRetry);

            const stream = await getAiStreamedResponse(
                selectedCharacter, 
                currentMood, 
                historyForRetry
            );
            
            let accumulatedText = '';
            let isNewMessage = true;
            const aiMessageId = `ai-retry-${Date.now()}`;

            for await (const chunk of stream) {
              accumulatedText += chunk.text;
              if (isNewMessage) {
                isNewMessage = false;
                set(state => {
                  state.chatHistory.push({
                    id: aiMessageId,
                    sender: 'ai',
                    text: accumulatedText,
                    character: selectedCharacter,
                    isStreaming: true,
                  });
                });
              } else {
                set(state => {
                  const streamingMsg = state.chatHistory.find(m => m.id === aiMessageId);
                  if (streamingMsg) {
                    streamingMsg.text = accumulatedText;
                  }
                });
              }
            }
            
            set(state => {
              const finalMsg = state.chatHistory.find(m => m.id === aiMessageId);
              if (finalMsg) {
                finalMsg.isStreaming = false;
              }
              state.isLoading = false;
            });
        } catch (error) {
            console.error("Retry failed:", error);
            set(state => {
                const msg = state.chatHistory.find(m => m.id === messageId);
                if (msg) {
                    msg.status = 'failed';
                }
                state.isLoading = false;
            });
        }
      },

      editUserMessage: async (messageId: string, newText: string) => {
        const { selectedCharacter, currentMood } = get();
        if (!selectedCharacter) return;

        set(state => {
          const index = state.chatHistory.findIndex(m => m.id === messageId);
          if (index !== -1) {
            state.chatHistory[index].text = newText;
            // Truncate history after this message
            state.chatHistory = state.chatHistory.slice(0, index + 1);
            state.isLoading = true;
          }
        });

        try {
          const stream = await getAiStreamedResponse(
            selectedCharacter, 
            currentMood, 
            get().chatHistory
          );

          let accumulatedText = '';
          let isNewMessage = true;
          const aiMessageId = `ai-edit-${Date.now()}`;

          for await (const chunk of stream) {
            accumulatedText += chunk.text;
            if (isNewMessage) {
              isNewMessage = false;
              set(state => {
                state.chatHistory.push({
                  id: aiMessageId,
                  sender: 'ai',
                  text: accumulatedText,
                  character: selectedCharacter,
                  isStreaming: true,
                });
              });
            } else {
              set(state => {
                const lastMessage = state.chatHistory[state.chatHistory.length - 1];
                if (lastMessage?.id === aiMessageId) {
                  lastMessage.text = accumulatedText;
                }
              });
            }
          }
          
          set(state => {
            const lastMessage = state.chatHistory[state.chatHistory.length - 1];
            if (lastMessage?.id === aiMessageId) {
              lastMessage.isStreaming = false;
            }
            state.isLoading = false;
          });

        } catch (error) {
          console.error(error);
          set(state => { state.isLoading = false; });
        }
      },
      
      addAiMessage: ({id, text, isStreaming = false}) => {
          const { selectedCharacter } = get();
          if (!selectedCharacter) return;
          
          set(state => {
              const existingMessage = state.chatHistory.find(m => m.id === id);
              if (existingMessage) {
                  existingMessage.text = text;
                  existingMessage.isStreaming = isStreaming;
              } else {
                  state.chatHistory.push({
                      id,
                      sender: 'ai',
                      text,
                      character: selectedCharacter,
                      isStreaming,
                  });
              }
          });
      },

      saveCurrentChat: async () => {
        const { selectedCharacter, chatHistory } = get();
        if (!selectedCharacter || chatHistory.length <= 1) {
            console.warn("Chat is too short to be saved.");
            return false;
        }

        set({ isLoading: true });

        try {
            const summary = await generateChatSummary(selectedCharacter.name, chatHistory);
            const newSavedChat: SavedChat = {
                id: `saved-${Date.now()}`,
                savedAt: new Date().toISOString(),
                character: selectedCharacter,
                chatHistory: chatHistory,
                summary: summary || "ملخص غير متوفر.",
            };

            set(state => {
                state.savedChats.unshift(newSavedChat);
            });
            get().checkAchievements();
            return true;
        } catch (error) {
            console.error("Failed to save chat:", error);
            return false;
        } finally {
            set({ isLoading: false });
        }
      },

      deleteSavedChat: (chatId: string) => {
          set(state => {
              state.savedChats = state.savedChats.filter(chat => chat.id !== chatId);
          });
      },

      addJournalEntry: ({ title, content }) => {
        const now = new Date().toISOString();
        const newEntry: JournalEntry = {
          id: `journal-${Date.now()}`,
          title,
          content,
          createdAt: now,
          updatedAt: now,
        };
        set(state => {
          state.journalEntries.unshift(newEntry);
        });
        get().checkAchievements();
      },

      updateJournalEntry: (updatedEntry) => {
        set(state => {
          const index = state.journalEntries.findIndex(e => e.id === updatedEntry.id);
          if (index !== -1) {
            state.journalEntries[index] = {
              ...updatedEntry,
              updatedAt: new Date().toISOString(),
            };
          }
        });
        get().checkAchievements();
      },

      deleteJournalEntry: (entryId) => {
        set(state => {
          state.journalEntries = state.journalEntries.filter(e => e.id !== entryId);
        });
      },

      setFontSize: (size) => {
        set({ fontSize: size });
      },
      setLineSpacing: (spacing) => {
        set({ lineSpacing: spacing });
      },
      setTheme: (themeId) => {
        set({ activeThemeId: themeId });
        get().checkAchievements();
      },
      
      completeOnboarding: () => {
        set({ onboardingCompleted: true });
      },
      
      completeDailyChallenge: () => {
          const today = getTodayDateString();
          set(state => {
              if (state.dailyChallenge?.date === today) {
                  state.dailyChallenge.completed = true;
                  if (!state.completedChallengeDates.includes(today)) {
                      state.completedChallengeDates.push(today);
                  }
              }
          });
          get().checkAchievements();
      },
      
      checkAchievements: () => {
        const state = get();
        const conditions: { [key: string]: () => boolean } = {
          'journal_1': () => state.journalEntries.length >= 1,
          'journal_5': () => state.journalEntries.length >= 5,
          'journal_10': () => state.journalEntries.length >= 10,
          'chat_1': () => state.savedChats.length >= 1,
          'chat_5': () => state.savedChats.length >= 5,
          'chat_3_chars': () => new Set(state.savedChats.map(c => c.character.id)).size >= 3,
          'streak_3': () => state.dailyStreak.count >= 3,
          'streak_7': () => state.dailyStreak.count >= 7,
          'customize_theme': () => state.activeThemeId !== DEFAULT_THEME_ID,
          'community_visit': () => state.currentView === 'community',
          'challenge_5': () => state.completedChallengeDates.length >= 5,
        };
        
        ACHIEVEMENTS.forEach(achievement => {
          if (!state.unlockedAchievements.includes(achievement.id)) {
            const condition = conditions[achievement.id];
            if (condition && condition()) {
              set(s => {
                s.unlockedAchievements.push(achievement.id);
                s.lastUnlockedAchievement = achievement;
              });
            }
          }
        });
      },
      
      dismissAchievementNotification: () => {
          set({ lastUnlockedAchievement: null });
      },

    })),
    {
      name: 'fadfada-app-state',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        currentScreen: state.currentScreen,
        selectedCharacter: state.selectedCharacter,
        chatHistory: state.chatHistory,
        currentMood: state.currentMood,
        fontSize: state.fontSize,
        lineSpacing: state.lineSpacing,
        savedChats: state.savedChats,
        journalEntries: state.journalEntries,
        activeThemeId: state.activeThemeId,
        onboardingCompleted: state.onboardingCompleted,
        unlockedAchievements: state.unlockedAchievements,
        dailyStreak: state.dailyStreak,
        dailyChallenge: state.dailyChallenge,
        completedChallengeDates: state.completedChallengeDates,
      }),
    }
  )
);
