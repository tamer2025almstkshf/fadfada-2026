
import React, { useState } from 'react';
import { useAppStore } from '../store';

// Re-using the background image from the original WelcomeScreen
const castleGateImage =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9PjsBCgoKDg0OGxAQGy4lHSUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAYUBlAMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABQYDBAcCAQj/xABOEAACAQMCAwMIBgYHCQQLAAABAgMABBEFEiExQQYHEyJRYXEUMoGRoRUjQlKxwdEWYnKS4fAXNDU2Q1Oy0uIjJVRjc4KiwsMkNERUY//EABoBAQADAQEBAAAAAAAAAAAAAAABAgMEBQb/xAAyEQACAgECBAQGAgIDAQAAAAAAAQIRAxIhBBMxQVEiMmFxFIGR8KGxwdEUFULhI/EjM//aAAwDAQACEQMRAD8A9UooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooAooooA-';

export const AuthScreen: React.FC = () => {
  const login = useAppStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Mock form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate and send credentials to a backend.
    // For this mock, we just call the login action.
    login();
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen p-4 text-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${castleGateImage})` }}
    >
      {/* Overlay to improve readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Auth Form Container */}
      <div className="relative z-10 w-full max-w-sm p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-2" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
          {isLoginMode ? 'أهلاً بعودتك' : 'انضمي إلينا'}
        </h1>
        <p className="text-white/80 mb-8">{isLoginMode ? 'سجلي دخولك إلى مساحتك الآمنة' : 'أنشئي حسابك الخاص'}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              required
              className="w-full px-4 py-3 bg-white/20 border-2 border-transparent rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-sky-300 focus:bg-white/30 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">كلمة المرور</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              required
              className="w-full px-4 py-3 bg-white/20 border-2 border-transparent rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-sky-300 focus:bg-white/30 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white/90 text-gray-900 font-bold text-lg rounded-full px-8 py-3 shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl transform hover:scale-105"
          >
            {isLoginMode ? 'دخول' : 'إنشاء حساب'}
          </button>
        </form>

        <p className="mt-8 text-sm">
          <span className="text-white/80">{isLoginMode ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}</span>
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="font-bold text-white hover:underline pr-2">
            {isLoginMode ? 'أنشئي حساب جديد' : 'سجلي دخولك'}
          </button>
        </p>
      </div>
    </div>
  );
};
