import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { CHARACTERS } from '../constants';
import type { ChatMessage } from '../types';

// A simplified message bubble for the onboarding flow
const OnboardingBubble: React.FC<{ message: { text: string; sender: 'ai' | 'user' }; icon?: string; gradient?: string, isTyping?: boolean }> = ({ message, icon, gradient, isTyping }) => {
    const isUser = message.sender === 'user';
    return (
        <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} message-enter-animation`}>
            {!isUser && icon && (
                <div className={`text-3xl p-2.5 h-11 w-11 flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} shadow-md flex-shrink-0`}>
                    {icon}
                </div>
            )}
            <div className={`relative p-3 shadow-md max-w-xs sm:max-w-sm ${isUser ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-t-2xl rounded-bl-2xl' : 'bg-white/90 text-gray-800 rounded-t-2xl rounded-br-2xl'}`}>
                {isTyping ? (
                     <div className="flex items-center justify-center gap-2 h-6 px-1">
                       <div className="w-2 h-2 rounded-full bg-gray-400 animate-typing-dot"></div>
                       <div className="w-2 h-2 rounded-full bg-gray-400 animate-typing-dot" style={{ animationDelay: '0.2s' }}></div>
                       <div className="w-2 h-2 rounded-full bg-gray-400 animate-typing-dot" style={{ animationDelay: '0.4s' }}></div>
                   </div>
                ) : (
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                )}
            </div>
        </div>
    );
};

// The scripted conversation flow
const onboardingScript = [
  { type: 'ai', text: 'أهلاً بكِ في فضفضة. أنا فاتن، صديقتك الحكيمة هنا لأسمعك.' },
  { type: 'ai', text: 'هذه مساحتك الآمنة، حيث يمكنكِ التعبير عن كل ما في قلبك بحرية وبدون أي حكم.' },
  { type: 'user_choice', text: 'لنبدأ رحلتنا معاً. هل أنتِ مستعدة؟', choices: ['نعم، أنا مستعدة', 'لنجرب ذلك'] },
  { type: 'ai', text: 'رائع! في فضفضة، ستجدين مجموعة من الصديقات، كل واحدة منا هنا لتقدم لكِ الدعم بطريقتها الخاصة.' },
  { type: 'ai', text: 'بعد هذه المحادثة، ستتمكنين من اختيار من تثقين بها اليوم.' },
  { type: 'user_choice', text: 'هل تودين المتابعة الآن؟', choices: ['بالتأكيد، لنكمل'] },
  { type: 'ai', text: 'ممتاز. تذكري دائماً، خصوصيتك هي أولويتنا القصوى. كل شيء تقولينه هنا يبقى هنا.' },
  { type: 'ai', text: 'أنتِ الآن جاهزة لدخول عالمك الخاص. أنا وبقية الصديقات بانتظارك في الداخل.' },
  { type: 'end' }
];

export const OnboardingScreen: React.FC = () => {
    const completeOnboarding = useAppStore((state) => state.completeOnboarding);
    const [messages, setMessages] = useState<Array<{ text: string; sender: 'ai' | 'user' }>>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [choices, setChoices] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const faten = CHARACTERS.find(c => c.id === 'faten')!;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        const processStep = () => {
            if (currentStep >= onboardingScript.length) return;

            const step = onboardingScript[currentStep];

            if (step.type === 'ai') {
                setIsTyping(true);
                setTimeout(() => {
                    setIsTyping(false);
                    setMessages(prev => [...prev, { text: step.text, sender: 'ai' }]);
                    setCurrentStep(prev => prev + 1);
                }, 1500); // Simulate typing delay
            } else if (step.type === 'user_choice') {
                 setIsTyping(true);
                setTimeout(() => {
                    setIsTyping(false);
                    setMessages(prev => [...prev, { text: step.text, sender: 'ai' }]);
                    setChoices(step.choices);
                }, 1500);
            } else if (step.type === 'end') {
                setTimeout(() => {
                    completeOnboarding();
                }, 2000);
            }
        };

        processStep();
    }, [currentStep, completeOnboarding]);

    const handleChoice = (choice: string) => {
        setMessages(prev => [...prev, { text: choice, sender: 'user' }]);
        setChoices([]);
        setCurrentStep(prev => prev + 1);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 flex items-center justify-center p-3 sm:p-4 bg-white/10 backdrop-blur-md shadow-md z-20">
                <div className="flex items-center gap-3">
                    <div className={`text-3xl p-2 rounded-full bg-gradient-to-br ${faten.gradient} shadow-md`}>
                        {faten.icon}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{faten.name}</h2>
                        <p className="text-xs text-blue-100">جولة تعريفية</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-2">
                <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((msg, index) => (
                        <OnboardingBubble key={index} message={msg} icon={faten.icon} gradient={faten.gradient} />
                    ))}
                    {isTyping && <OnboardingBubble message={{text: '', sender: 'ai'}} icon={faten.icon} gradient={faten.gradient} isTyping />}
                    <div ref={messagesEndRef} />
                </div>
            </main>
            
            <footer className="sticky bottom-0 z-10 p-4">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
                    {choices.map((choice, index) => (
                         <button
                            key={index}
                            onClick={() => handleChoice(choice)}
                            className="w-full max-w-sm bg-white/90 text-gray-900 font-bold rounded-full px-6 py-3 shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 ease-in-out hover:-translate-y-1 transform animate-onboarding-enter"
                            style={{animationDelay: `${index * 100}ms`}}
                         >
                            {choice}
                        </button>
                    ))}
                </div>
            </footer>
        </div>
    );
};
