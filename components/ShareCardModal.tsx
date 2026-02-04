import React, { useRef, useEffect } from 'react';
import { THEMES } from '../constants';
import type { ChatMessage } from '../types';

interface ShareCardModalProps {
  message: ChatMessage;
  onClose: () => void;
}

// Helper function to wrap text on the canvas
function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}

// Helper to get linear gradient from Tailwind classes
// FIX: The original function had a reference to `message` which is out of scope.
// It also contained unused logic. This version removes the dead code and correctly
// uses the `gradientClass` parameter that is passed in.
const getGradient = (gradientClass: string, ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Default gradient colors
    let color1 = '#38bdf8'; // sky-400
    let color2 = '#3b82f6'; // blue-700
    
    if (gradientClass) {
        // This is a simplified mapping from Tailwind classes to hex codes. A real app might need a more robust system.
        const colorMap: Record<string, string> = {
            'from-green-400': '#4ade80', 'to-teal-500': '#14b8a6',
            'from-pink-500': '#ec4899', 'to-rose-500': '#f43f5e',
            'from-purple-500': '#a855f7', 'to-indigo-500': '#6366f1',
            'from-blue-400': '#60a5fa', 'to-sky-500': '#0ea5e9',
            'from-red-500': '#ef4444', 'to-orange-500': '#f97316',
            'from-slate-500': '#64748b', 'to-gray-600': '#4b5563',
            'from-blue-700': '#1d4ed8', 'to-indigo-800': '#3730a3',
            'from-purple-700': '#7e22ce', 'to-fuchsia-800': '#a21caf',
        };
        const [fromClass, toClass] = gradientClass.split(' ');
        color1 = colorMap[fromClass] || color1;
        color2 = colorMap[toClass] || color2;
    }

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}


export const ShareCardModal: React.FC<ShareCardModalProps> = ({ message, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const character = message.character;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !character) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 500;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    ctx.fillStyle = getGradient(character.gradient, ctx, width, height);
    ctx.fillRect(0, 0, width, height);
    
    // Add a subtle pattern or texture if desired
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for(let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // 2. Draw Character Icon
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(character.icon, width / 2, height / 2 - 100);


    // 3. Draw Text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px Cairo, sans-serif';
    const text = `"${message.text}"`;
    wrapText(ctx, text, width / 2, height / 2, width - 80, 32);

    // 4. Draw attribution
    ctx.font = '16px Cairo, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`- ${character.name}`, width / 2, height - 80);
    
    // 5. Draw App Watermark
    ctx.font = 'italic 14px Cairo, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('من تطبيق فضفضة نساء', width / 2, height - 30);

  }, [message, character]);

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.share) return;

    canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
            await navigator.share({
                files: [new File([blob], 'fadfada-quote.png', { type: 'image/png' })],
                title: 'اقتباس من فضفضة',
                text: `"${message.text}" - ${message.character?.name}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }, 'image/png');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'fadfada-quote.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative w-full max-w-sm bg-white/10 rounded-2xl shadow-2xl p-6 text-white animate-mood-card-enter" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-center">مشاركة الاقتباس</h2>
        <canvas ref={canvasRef} className="w-full h-auto rounded-lg shadow-lg" />
        <div className="mt-6 flex justify-center gap-4">
          {navigator.share && (
            <button onClick={handleShare} className="flex-1 px-4 py-3 bg-blue-500 font-semibold rounded-lg shadow-md transition-colors hover:bg-blue-600">مشاركة</button>
          )}
          <button onClick={handleDownload} className="flex-1 px-4 py-3 bg-white/20 font-semibold rounded-lg hover:bg-white/30">تحميل</button>
        </div>
        <button onClick={onClose} className="absolute top-2 right-2 p-2 text-white/70 rounded-full hover:bg-white/20" aria-label="إغلاق">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};
