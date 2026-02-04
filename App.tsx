
import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from './store';
import { THEMES } from './constants';
import { playSentSound, playReceivedSound, playAchievementSound } from './services/geminiService';

// Import all screens
import { WelcomeScreen } from './components/WelcomeScreen';
import { CharacterSelection } from './components/CharacterSelection';
import { MoodCheckinScreen } from './components/MoodCheckinScreen';
import { ChatScreen } from './components/ChatScreen';
import { AuthScreen } from './components/AuthScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CommunityHubScreen } from './components/CommunityHubScreen';
import { JournalScreen } from './components/JournalScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { OnboardingScreen } from './components/OnboardingScreen';


const Waves: React.FC = () => (
    <div className="waves-container pointer-events-none">
      <svg className="waves" xmlns="http://www.w3.org/2000/svg"
      viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g className="parallax">
          <use href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
          <use href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
          <use href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
          <use href="#gentle-wave" x="48" y="7" fill="#fff" />
        </g>
      </svg>
    </div>
);

const AIChatFlow: React.FC = () => {
  const currentScreen = useAppStore((state) => state.currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'selection':
        return <CharacterSelection />;
      case 'moodCheckin':
        return <MoodCheckinScreen />;
      case 'chat':
        return <ChatScreen />;
      default:
        return <WelcomeScreen />;
    }
  };
  
  return (
     <div key={currentScreen} className="relative screen-enter-animation">
      {renderScreen()}
    </div>
  )
};

const MainApp: React.FC = () => {
  const currentView = useAppStore((state) => state.currentView);
  
  const renderView = () => {
    switch (currentView) {
      case 'aiChat':
        return <AIChatFlow />;
      case 'community':
        return <CommunityHubScreen />;
      case 'journal':
        return <JournalScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <AIChatFlow />;
    }
  };

  return (
    <div className="relative min-h-screen">
      <main className="pb-24"> {/* Padding to avoid overlap with nav bar */}
        {renderView()}
      </main>
      <BottomNavBar />
    </div>
  );
};

const AchievementNotification: React.FC = () => {
    const { achievement, dismiss } = useAppStore(state => ({
        achievement: state.lastUnlockedAchievement,
        dismiss: state.dismissAchievementNotification,
    }));
    
    const [isExiting, setIsExiting] = useState(false);
    
    useEffect(() => {
        if (achievement) {
            playAchievementSound();
            setIsExiting(false); // Reset for new achievements

            const exitTimer = setTimeout(() => {
                setIsExiting(true);
            }, 3500); // Start exit animation 0.5s before dismissal

            const dismissTimer = setTimeout(() => {
                dismiss();
            }, 4000); // Fully dismiss after 4s

            return () => {
                clearTimeout(exitTimer);
                clearTimeout(dismissTimer);
            };
        }
    }, [achievement, dismiss]);
    
    if (!achievement) return null;
    
    return (
        <div className={`fixed top-5 left-1/2 z-[9999] w-full max-w-sm px-4 ${isExiting ? 'animate-achievement-exit' : 'animate-achievement-enter'}`}>
            <div className="relative overflow-hidden flex items-center gap-4 p-4 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl shadow-2xl border border-white/20">
                <div className="text-4xl animate-pulse-glow">{achievement.icon}</div>
                <div>
                    <h3 className="font-bold text-white">تم فتح إنجاز جديد!</h3>
                    <p className="text-sm text-purple-200">{achievement.name}</p>
                </div>
                {/* Progress Bar visual indicator */}
                <div className="absolute bottom-0 left-0 h-1 bg-white/50 animate-progress-bar"></div>
            </div>
        </div>
    );
};

/**
 * Custom hook to track the previous value of a state or prop.
 * @param value The value to track.
 * @returns The value from the previous render.
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


const App: React.FC = () => {
  const { isAuthenticated, activeThemeId, chatHistory, onboardingCompleted } = useAppStore(state => ({
      isAuthenticated: state.isAuthenticated,
      activeThemeId: state.activeThemeId,
      chatHistory: state.chatHistory,
      onboardingCompleted: state.onboardingCompleted,
  }));

  // Sound effect logic for chat messages, triggered by changes in chatHistory
  const prevChatHistory = usePrevious(chatHistory);
  useEffect(() => {
    // Guard against running on initial load or when history shrinks/doesn't change
    if (!isAuthenticated || !prevChatHistory || prevChatHistory.length >= chatHistory.length) {
      return;
    }

    // Get the newly added message
    const newMessage = chatHistory[chatHistory.length - 1];

    if (newMessage.sender === 'user') {
      playSentSound();
    } else if (newMessage.sender === 'ai') {
      playReceivedSound();
    }
  }, [chatHistory, isAuthenticated, prevChatHistory]);


  const activeTheme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div key="auth" className="screen-enter-animation">
          <AuthScreen />
        </div>
      );
    }
    if (!onboardingCompleted) {
       return (
        <div key="onboarding" className="screen-enter-animation">
          <OnboardingScreen />
        </div>
      );
    }
    return <MainApp />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${activeTheme.gradient.from} ${activeTheme.gradient.to} text-white transition-colors duration-500`}>
      <AchievementNotification />
      <div className="relative z-10">
         {renderContent()}
      </div>
      <Waves />
    </div>
  );
};

export default App;