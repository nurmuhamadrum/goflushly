import React, { useState } from 'react';
import { PhoneMockup, MockupScreen } from './PhoneMockup';
import { MapPin, Calendar, Zap, Smile, Sparkles, Compass, BarChart3, WifiOff } from 'lucide-react';
import { Badge, BadgeText, Heading, Text, VStack } from './ui';
import { useLanguage } from '../i18n/LanguageContext';

export const InteractiveMockup: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<MockupScreen>('map');
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const tabs: { id: MockupScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'map', label: isEn ? 'Peta Pribadi' : 'Peta Pribadi', icon: <MapPin className="w-4 h-4" /> },
    { id: 'quick-log', label: isEn ? 'Quick Log (3 Detik)' : 'Quick Log (3 Detik)', icon: <Zap className="w-4 h-4" /> },
    { id: 'mood', label: 'Mood & Bristol', icon: <Smile className="w-4 h-4" /> },
    { id: 'timeline', label: isEn ? 'Diary & Stats' : 'Riwayat & Stats', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <section id="preview" className="py-20 md:py-28 border-b border-outline-100 bg-background-50 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-primary-500/8 via-secondary-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        <VStack space="sm" className="text-center max-w-2xl mx-auto mb-10 items-center">
          <Badge action="secondary" size="lg" className="shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <BadgeText>{isEn ? 'Live Interactive Simulator' : 'Simulasi Interaktif Langsung'}</BadgeText>
          </Badge>
          <Heading as="h2" size="2xl" className="font-extrabold text-typography-900 tracking-tight">
            {isEn ? 'Experience the App Right in Your Browser' : 'Coba Langsung Aplikasinya di Layar'}
          </Heading>
          <Text size="sm" className="leading-relaxed text-typography-600 max-w-lg">
            {isEn
              ? "Switch tabs or click buttons inside the phone screen to experience GoFlushly's fluid, snappy flow."
              : 'Pilih tab di bawah atau sentuh tombol di dalam layar HP simulator untuk merasakan alur sat-set GoFlushly.'}
          </Text>

          {/* Segmented Control iOS / macOS Style */}
          <div className="p-1.5 rounded-2xl bg-slate-200/80 backdrop-blur-sm inline-flex items-center gap-1.5 flex-wrap justify-center mt-4 shadow-inner border border-slate-300/40">
            {tabs.map((tab) => {
              const isActive = activeScreen === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveScreen(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-primary-600 shadow-md transform scale-[1.02]'
                      : 'text-typography-600 hover:text-typography-900 hover:bg-white/40'
                  }`}
                >
                  <span className={isActive ? 'text-primary-600' : 'text-typography-500'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </VStack>

        {/* Simulator Frame Stage with Floating Cards */}
        <div className="relative flex justify-center items-center mt-6 py-4">
          
          {/* Left Floating Feature Cards (Desktop) */}
          <div className="hidden xl:flex flex-col gap-4 absolute left-12 top-1/2 -translate-y-1/2 w-64 pointer-events-none">
            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-typography-900">Sat-Set &lt; 3 Detik</span>
                <span className="block text-[11px] text-typography-500">2-tap log instan di toilet</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <WifiOff className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-typography-900">100% Offline</span>
                <span className="block text-[11px] text-typography-500">Aman tanpa internet</span>
              </div>
            </div>
          </div>

          {/* Central Phone Mockup with Glow Backdrop */}
          <div className="relative z-10 transition-transform duration-300 hover:scale-[1.01]">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/15 via-secondary-500/15 to-primary-500/15 rounded-[50px] blur-2xl -z-10" />
            <PhoneMockup currentScreen={activeScreen} onScreenChange={setActiveScreen} />
          </div>

          {/* Right Floating Feature Cards (Desktop) */}
          <div className="hidden xl:flex flex-col gap-4 absolute right-12 top-1/2 -translate-y-1/2 w-64 pointer-events-none">
            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-typography-900">Auto Geotagging</span>
                <span className="block text-[11px] text-typography-500">Ketinggian mdpl & distrik</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-typography-900">Skala Bristol & Hidrasi</span>
                <span className="block text-[11px] text-typography-500">Statistik visual berkala</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
