import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';

// Base64 encoded image for the background
const castleGateImage =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9PjsBCgoKDg0OGxAQGy4lHSUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAYUBlAMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABQYDBAcCAQj/xABOEAACAQMCAwMIBgYHCQQLAAABAgMABBEFEiExQQYHEyJRYXEUMoGRoRUjQlKxwdEWYnKS4fAXNDU2Q1Oy0uIjJVRjc4KiwsMkNERUY//EABoBAQADAQEBAAAAAAAAAAAAAAABAgMEBQb/xAAyEQACAgECBAQGAgIDAQAAAAAAAQIRAxIhBBMxQVEiMmFxFIGR8KGxwdEUFULhI/EjM//aAAwDAQACEQMRAD8A9UooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooA-';

export const WelcomeScreen: React.FC = () => {
  const goToSelectionScreen = useAppStore((state) => state.goToSelectionScreen);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTextFading, setIsTextFading] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const zoomTimerRef = useRef<number | null>(null);
  const enterTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Trigger fade-in animation on mount
    const loadedTimer = setTimeout(() => setIsLoaded(true), 100);
    
    // Cleanup function to clear timers if the component unmounts mid-animation
    return () => {
      clearTimeout(loadedTimer);
      if (zoomTimerRef.current) {
        clearTimeout(zoomTimerRef.current);
      }
      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current);
      }
    };
  }, []);

  const handleEnterClick = () => {
    if (isTextFading || isZooming) return;

    // 1. Start fading the text out
    setIsTextFading(true);

    // 2. After text fade (500ms), start the zoom
    zoomTimerRef.current = window.setTimeout(() => {
      setIsZooming(true);
    }, 500);

    // 3. After total animation time (500ms fade + 1500ms zoom), transition to next screen
    enterTimerRef.current = window.setTimeout(() => {
      goToSelectionScreen();
    }, 2000);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-between min-h-screen p-4 text-center overflow-hidden bg-cover bg-center pb-[150px]"
      style={{
        backgroundImage: `url(${castleGateImage})`,
        backgroundPosition: isZooming ? 'center 60%' : 'center 50%',
        transform: isZooming ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 1.5s ease-in-out, background-position 1.5s ease-in-out',
      }}
    >
      {/* Overlay to improve text readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content container */}
      <div className={`relative z-10 w-full transition-opacity duration-500 ${isLoaded && !isTextFading ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="mt-16 text-5xl md:text-6xl font-bold text-white" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.9)'}}>
          فضفضة نساء
        </h1>
        <p className="mt-2 text-xl md:text-2xl text-white/90" style={{textShadow: '1px 1px 6px rgba(0,0,0,0.8)'}}>
          مساحتك الآمنة
        </p>
      </div>

      {/* Button and Footer */}
      <div className={`relative z-10 w-full transition-opacity duration-500 delay-100 ${isLoaded && !isTextFading ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={handleEnterClick}
          className="bg-white/90 text-gray-900 font-bold text-lg rounded-full px-8 py-4 shadow-2xl backdrop-blur-sm border border-white/20 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_6px_25px_rgba(0,0,0,0.5)] transform hover:scale-105"
        >
          ادخلي عالمك الخاص
        </button>
        <p className="mt-6 text-sm text-white/80 max-w-sm mx-auto" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.9)'}}>
          هنا، كل الأسرار في أمان. مساحة للنساء فقط، حيث الخصوصية هي الأولوية القصوى.
        </p>
        <div className="mt-8 mb-4 text-xs text-white/70">
          <p>المستكشف للتطوير و خدمات الرصد الاعلامي</p>
          <p>www.almstkshf.com</p>
          <p>المطورة ديانا قاسم</p>
        </div>
      </div>
    </div>
  );
};