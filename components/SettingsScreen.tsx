import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { THEMES } from '../constants';

// A reusable Section component for better organization
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h2 className="text-xl font-semibold text-blue-100 mb-2 border-b-2 border-white/10 pb-2">
            {title}
        </h2>
        <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm">
            {children}
        </div>
    </div>
);


interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  control?: React.ReactNode;
}
const SettingsItem: React.FC<SettingsItemProps> = ({ icon, title, subtitle, control }) => (
  <div className="flex items-center gap-4 py-3">
    <div className="p-2 bg-white/10 rounded-lg text-blue-200">{icon}</div>
    <div className="flex-1">
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-sm text-blue-200/80">{subtitle}</p>
    </div>
    {control && <div>{control}</div>}
  </div>
);

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled = false }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="sr-only peer"
    />
    <div className={`w-11 h-6 bg-white/20 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
  </label>
);

const ChevronRightIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);


export const SettingsScreen: React.FC = () => {
    const { 
        fontSize,
        lineSpacing,
        setFontSize,
        setLineSpacing,
        activeThemeId,
        setTheme,
    } = useAppStore(state => ({
        fontSize: state.fontSize,
        lineSpacing: state.lineSpacing,
        setFontSize: state.setFontSize,
        setLineSpacing: state.setLineSpacing,
        activeThemeId: state.activeThemeId,
        setTheme: state.setTheme,
    }));
    
    // --- Push Notification Logic (as it was) ---
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [notificationSupport, setNotificationSupport] = useState(true);

    const VAPID_PUBLIC_KEY = 'BNo5gWjWTfGCiB1M9eT5B523-y3r_cCxFLbL61fGKFyQn_MFlyR7A5vNBqTmsQJZn2BgY_1-lJwr2jLhZZd-yTY';

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications are not supported by this browser.');
            setNotificationSupport(false);
            return;
        }
        setNotificationsEnabled(Notification.permission === 'granted');
    }, []);
    
    const subscribeUser = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log('User is subscribed:', subscription);
        alert('تم تفعيل الإشعارات بنجاح!');
        setNotificationsEnabled(true);
      } catch (error) {
        console.error('Failed to subscribe the user: ', error);
        alert('فشل تفعيل الإشعارات. يرجى المحاولة مرة أخرى.');
        setNotificationsEnabled(false);
      }
    };

    const unsubscribeUser = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                console.log('User is unsubscribed.');
                setNotificationsEnabled(false);
                alert('تم إيقاف الإشعارات.');
            }
        } catch (error) {
            console.error('Failed to unsubscribe the user: ', error);
        }
    };

    const handleNotificationsToggle = async (enabled: boolean) => {
        setIsSubscribing(true);
        if (enabled) {
            if (Notification.permission === 'granted') {
                await subscribeUser();
            } else if (Notification.permission === 'denied') {
                alert('تم رفض إذن الإشعارات. يرجى تمكينها من إعدادات المتصفح.');
            } else {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    await subscribeUser();
                } else {
                     alert('لم يتم منح إذن الإشعارات.');
                }
            }
        } else {
            await unsubscribeUser();
        }
        setIsSubscribing(false);
    };

  return (
    <div className="min-h-screen p-4 pb-24">
        <header className="pt-6 pb-4">
            <h1 className="text-4xl font-bold text-white drop-shadow-md">
                الإعدادات
            </h1>
        </header>

        <main className="mt-6 space-y-8">
            <Section title="المظهر">
                <p className="text-sm text-blue-200/80 mb-4">
                    اختاري نسق الألوان الذي يناسبكِ.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {THEMES.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => setTheme(theme.id)}
                            className={`p-2 rounded-lg text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${activeThemeId === theme.id ? 'ring-2 ring-white shadow-lg bg-white/20' : 'hover:bg-white/10'}`}
                            aria-pressed={activeThemeId === theme.id}
                        >
                            <div className={`w-full h-12 rounded-md bg-gradient-to-r ${theme.gradient.from} ${theme.gradient.to} mb-2 border border-white/20`}></div>
                            <span className="text-sm font-semibold text-white">{theme.name}</span>
                        </button>
                    ))}
                </div>
            </Section>

            <Section title="إمكانية الوصول">
                <div className="space-y-4">
                    <div>
                        <SettingsItem
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>}
                            title="حجم الخط"
                            subtitle="تكبير أو تصغير حجم النص في المحادثات"
                        />
                        <input id="font-size" type="range" min="0.8" max="1.5" step="0.1" value={fontSize} onChange={e => setFontSize(parseFloat(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mt-2" />
                    </div>
                    <div>
                        <SettingsItem
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>}
                            title="تباعد الأسطر"
                            subtitle="زيادة أو تقليل المسافة بين السطور"
                        />
                        <input id="line-spacing" type="range" min="1.2" max="2.2" step="0.1" value={lineSpacing} onChange={e => setLineSpacing(parseFloat(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mt-2" />
                    </div>
                </div>
            </Section>

            <Section title="عام">
                <div className="divide-y divide-white/10">
                    <SettingsItem
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                        title="الإشعارات"
                        subtitle={notificationSupport ? "تنبيهات الرسائل الجديدة والنشاطات" : "الإشعارات غير مدعومة"}
                        control={
                           <ToggleSwitch
                                checked={notificationsEnabled}
                                onChange={handleNotificationsToggle}
                                disabled={!notificationSupport || isSubscribing}
                            />
                        }
                    />
                    <button onClick={() => alert('ميزة تغيير اللغة قيد التطوير.')} className="w-full text-right transition-colors hover:bg-white/5 rounded-lg">
                         <SettingsItem
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m-9 9h18" /></svg>}
                            title="اللغة"
                            subtitle="العربية"
                            control={<ChevronRightIcon />}
                        />
                    </button>
                    <button onClick={() => alert('سيتم إضافة إعدادات الخصوصية قريباً.')} className="w-full text-right transition-colors hover:bg-white/5 rounded-lg">
                         <SettingsItem
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                            title="الخصوصية"
                            subtitle="إدارة بياناتك ومحادثاتك"
                            control={<ChevronRightIcon />}
                        />
                    </button>
                </div>
            </Section>
        </main>
    </div>
  );
};
