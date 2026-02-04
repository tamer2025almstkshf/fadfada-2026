
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import type { ChatMessage, SpeechRecognition } from '../types';
import { THEMES } from '../constants';
import { ShareCardModal } from './ShareCardModal';

// =============================
//      Speech Recognition Hook
// =============================
const useSpeechRecognition = (onResult: (transcript: string) => void, onEnd: () => void) => {
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            console.warn("Speech Recognition API is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false; 
        recognition.interimResults = true;
        recognition.lang = 'ar-SA'; 

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript;
            }
            onResult(transcript);
        };

        recognition.onend = () => {
            setIsListening(false);
            onEnd();
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognitionRef.current?.stop();
        };
    }, [onResult, onEnd]);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            onResult(''); 
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    return { isListening, toggleListening };
};

// =============================
//      Message Bubble
// =============================
const MessageBubble: React.FC<{ 
    message: ChatMessage, 
    onShare: (message: ChatMessage) => void,
    isEditable?: boolean,
    isEditing?: boolean,
    onEditStart?: (id: string, text: string) => void,
    onEditCancel?: () => void,
    onEditSave?: (text: string) => void,
}> = ({ message, onShare, isEditable, isEditing, onEditStart, onEditCancel, onEditSave }) => {
    const { retryMessage, fontSize, lineSpacing } = useAppStore(state => ({
        retryMessage: state.retryMessage,
        fontSize: state.fontSize,
        lineSpacing: state.lineSpacing,
    }));
    
    const [tempText, setTempText] = useState(message.text);
    
    // Sync tempText when editing starts or message changes
    useEffect(() => {
        if (isEditing) {
            setTempText(message.text);
        }
    }, [isEditing, message.text]);

    const isUser = message.sender === 'user';
    const character = message.character;
    const gradient = character?.gradient || 'from-gray-400 to-gray-500';
    const isFailed = message.status === 'failed';

    const userBubbleStyle = isFailed 
        ? 'bg-gray-200 text-gray-800 rounded-t-2xl rounded-bl-2xl border-2 border-red-500'
        : 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-t-2xl rounded-bl-2xl';

    return (
        <div className={`group relative flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} message-enter-animation`}>
            {!isUser && character && (
                <div className={`text-3xl p-2.5 h-11 w-11 flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} shadow-md flex-shrink-0`}>
                    {character.icon}
                </div>
            )}
            <div className={`relative p-3 shadow-md w-full max-w-xs sm:max-w-sm md:max-w-md ${isUser ? userBubbleStyle : 'bg-white/90 text-gray-800 rounded-t-2xl rounded-br-2xl'}`}>
                {message.imageUrl && !isEditing && <img src={message.imageUrl} alt="مرفق" className="rounded-lg mb-2 max-h-60 w-full object-cover" />}
                
                {isEditing ? (
                    <div className="flex flex-col gap-3">
                        <textarea
                            autoFocus
                            value={tempText}
                            onChange={(e) => setTempText(e.target.value)}
                            className="w-full bg-white/20 border border-white/40 rounded-xl p-3 text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 resize-none min-h-[110px] outline-none transition-all"
                        />
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={onEditCancel} 
                                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors border border-white/20"
                            >
                                إلغاء
                            </button>
                            <button 
                                onClick={() => onEditSave?.(tempText)} 
                                className="px-4 py-1.5 bg-white text-blue-600 font-bold rounded-lg text-sm transition-colors shadow-lg active:scale-95"
                            >
                                تحديث
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {message.text && (
                            <p className="whitespace-pre-wrap break-words" style={{ fontSize: `${fontSize}rem`, lineHeight: lineSpacing }}>
                                {message.text}
                                {message.isStreaming && <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse"></span>}
                            </p>
                        )}
                    </>
                )}

                {isFailed && !isEditing && (
                    <button onClick={() => retryMessage(message.id)} className="absolute -bottom-3 -left-3 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors" aria-label="إعادة المحاولة">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1