import React, { useState } from 'react';
import {
  ChevronLeft,
  Navigation,
  Layers,
  Wifi,
  Battery,
  ShieldCheck,
  Zap,
  Flame,
  Ban,
  Play,
  MapPin,
  Volume2,
} from 'lucide-react';
import { MrPlopSVG, LilDripSVG, SirFlushSVG } from './MascotSVGs';
import { Box, VStack, HStack, Heading, Text, Button, ButtonText } from './ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useWebCopy } from '../i18n/translations';
import { playMascotSound } from '../utils/mascotSound';

type ActiveMascot = 'plop' | 'drip' | 'flush';

interface HeroPin {
  id: string;
  mascot: ActiveMascot;
  top: string;
  left?: string;
  right?: string;
  bg: string;
  dot: string;
  place: string;
  moodId: string;
  moodEn: string;
  time: string;
  delayed?: boolean;
}

const HERO_PINS: HeroPin[] = [
  {
    id: 'pin-plop',
    mascot: 'plop',
    top: '8%',
    left: '17%',
    bg: 'bg-[#FAF4EE]',
    dot: 'bg-[#FBBF24]',
    place: 'Grand Indonesia',
    moodId: 'Mr. Plop • Plong Sekali ✨',
    moodEn: 'Mr. Plop • Super Relieved ✨',
    time: '08:30',
  },
  {
    id: 'pin-flush',
    mascot: 'flush',
    top: '22%',
    right: '13%',
    bg: 'bg-[#2447F9]',
    dot: 'bg-primary-500',
    place: 'SCBD Sudirman',
    moodId: 'Sir Flush • Kombo Sukses 🚽',
    moodEn: 'Sir Flush • Combo Done 🚽',
    time: '12:05',
    delayed: true,
  },
  {
    id: 'pin-drip-1',
    mascot: 'drip',
    top: '41%',
    left: '40%',
    bg: 'bg-[#F0F7FF]',
    dot: 'bg-primary-500',
    place: 'Menteng, Jakpus',
    moodId: "Lil' Drip • Lega Banget 😌",
    moodEn: "Lil' Drip • Refreshing 😌",
    time: '14:15',
  },
  {
    id: 'pin-drip-2',
    mascot: 'drip',
    top: '59%',
    left: '13%',
    bg: 'bg-[#F0F7FF]',
    dot: 'bg-primary-500',
    place: 'GBK Senayan',
    moodId: "Lil' Drip • Hidrasi Juara 💧",
    moodEn: "Lil' Drip • Hydration Pro 💧",
    time: '17:40',
    delayed: true,
  },
];

export const HeroSection: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const t = useWebCopy(lang).hero;

  const [selectedMascot, setSelectedMascot] = useState<ActiveMascot>('drip');
  const [selectedPinId, setSelectedPinId] = useState<string>('pin-drip-1');
  const [bouncingMascot, setBouncingMascot] = useState<ActiveMascot | null>(null);

  const handleSelectMascot = (mascot: ActiveMascot, specificPinId?: string) => {
    playMascotSound(mascot);
    setSelectedMascot(mascot);
    setBouncingMascot(mascot);
    const matchingPin = specificPinId
      ? HERO_PINS.find((p) => p.id === specificPinId)
      : HERO_PINS.find((p) => p.mascot === mascot);
    if (matchingPin) {
      setSelectedPinId(matchingPin.id);
    }
    setTimeout(() => setBouncingMascot(null), 850);
  };

  const activePin = HERO_PINS.find((p) => p.id === selectedPinId) || HERO_PINS[2];

  const activeQuote =
    selectedMascot === 'plop'
      ? t.plopQuote
      : selectedMascot === 'drip'
      ? t.dripQuote
      : t.flushQuote;

  const activeMascotName =
    selectedMascot === 'plop' ? 'Mr. Plop' : selectedMascot === 'drip' ? "Lil' Drip" : 'Sir Flush';

  const activeMascotBg =
    selectedMascot === 'plop'
      ? 'bg-[#FAF4EE]'
      : selectedMascot === 'drip'
      ? 'bg-[#F0F7FF]'
      : 'bg-[#2447F9]';

  const microHighlights = [
    {
      icon: Zap,
      iconBg: 'bg-primary-0 text-primary-500',
      title: isEn ? '< 3 Sec Log' : '< 3 Detik',
      sub: isEn ? '2-Tap Quick Log' : 'Catat 2-Tap',
    },
    {
      icon: ShieldCheck,
      iconBg: 'bg-secondary-0 text-secondary-500',
      title: isEn ? '100% Local' : '100% Lokal',
      sub: isEn ? 'Offline SQLite' : 'SQLite Offline',
    },
    {
      icon: Ban,
      iconBg: 'bg-[#FEE2E2] text-emergency',
      title: isEn ? 'Zero Ads' : 'Nol Iklan',
      sub: isEn ? 'No Trackers' : 'Tanpa Pelacak',
    },
  ];

  return (
    <section className="relative overflow-hidden pt-6 pb-16 sm:pt-10 sm:pb-24 bg-background-50">
      {/* Layered Studio Background: Radial Dot-Grid + Soft Drifting Aurora Mesh */}
      <div className="absolute inset-0 hero-dot-grid pointer-events-none" />
      <div className="absolute -top-24 right-[-6%] w-[460px] h-[460px] rounded-full bg-primary-500/10 blur-[110px] pointer-events-none animate-aurora" />
      <div className="absolute bottom-[-12%] left-[-8%] w-[420px] h-[420px] rounded-full bg-secondary-500/10 blur-[110px] pointer-events-none animate-aurora" />
      <div className="absolute top-[38%] left-[44%] w-[280px] h-[280px] rounded-full bg-[#FDE6C9]/45 blur-[95px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* ========================================= */}
        {/* LEFT COLUMN: MODERN EDITORIAL + BENTO     */}
        {/* ========================================= */}
        <VStack space="lg" className="lg:col-span-6 text-center lg:text-left items-center lg:items-start">
          {/* Modern Glass Status Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-outline-200 shadow-xs animate-hero-up">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-500" />
            </span>
            <span className="text-xs font-bold text-typography-900">
              {isEn ? '100% Offline-First & Private' : '100% Offline-First & Privat'}
            </span>
            <span className="text-[10px] font-extrabold text-secondary-500 bg-secondary-0 px-2 py-0.5 rounded-full">
              v1.0
            </span>
          </div>

          {/* Crisp Poppins Headline with Royal Blue -> Mint Gradient Accent */}
          <Heading as="h1" size="4xl" className="animate-hero-up-1">
            Track. Log.
            <br />
            <span className="bg-gradient-to-r from-primary-500 via-[#3B82F6] to-secondary-500 bg-clip-text text-transparent">
              Lega.
            </span>
          </Heading>

          {/* Clean Value Proposition Subtitle */}
          <Text size="md" className="sm:text-lg text-typography-600 max-w-lg leading-relaxed animate-hero-up-2">
            {isEn
              ? 'Your personal daily poop & pee lifelogger. Fast, cute, ad-free, and stored 100% privately on your device — never a public toilet finder.'
              : 'Catatan harian BAB & BAK pribadimu. Cepat, lucu, bebas iklan, dan 100% tersimpan aman di perangkatmu — bukan pencari toilet umum.'}
          </Text>

          {/* Gluestack Primary CTA + Official Google Play & App Store Coming Soon Buttons */}
          <VStack space="md" className="pt-1 w-full items-center lg:items-start animate-hero-up-3">
            <HStack space="sm" className="flex-wrap justify-center lg:justify-start">
              <Button href="#preview" action="primary" size="lg" className="btn-shimmer shadow-lg shadow-primary-500/25">
                <Play className="w-4 h-4 fill-white" />
                <ButtonText>{isEn ? 'Try Interactive Demo' : 'Coba Demo Interaktif'}</ButtonText>
              </Button>
            </HStack>

            <HStack space="sm" className="flex-wrap justify-center lg:justify-start">
              {/* Google Play Coming Soon Button */}
              <a
                href="#download"
                className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-background-900 hover:bg-typography-800 text-white border border-white/10 shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <svg className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="none">
                  <path d="M3.6 2.3C3.2 2.7 3 3.3 3 4.1V19.9C3 20.7 3.2 21.3 3.6 21.7L3.7 21.8L12.9 12.6V12V11.4L3.7 2.2L3.6 2.3Z" fill="#38BDF8" />
                  <path d="M16 15.7L12.9 12.6V12V11.4L16 8.3L16.1 8.4L19.8 10.5C20.8 11.1 20.8 12.1 19.8 12.7L16.1 14.8L16 15.7Z" fill="#FBBF24" />
                  <path d="M16.1 14.8L12.9 12L3.6 21.7C4 22.1 4.6 22.1 5.4 21.7L16.1 14.8Z" fill="#EF4444" />
                  <path d="M16.1 8.4L5.4 2.3C4.6 1.9 4 1.9 3.6 2.3L12.9 12L16.1 8.4Z" fill="#34D399" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[10px] font-bold text-secondary-400 uppercase tracking-wider">
                    Coming Soon
                  </span>
                  <span className="block text-sm font-extrabold text-white">Google Play</span>
                </div>
              </a>

              {/* App Store Coming Soon Button */}
              <a
                href="#download"
                className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-background-900 hover:bg-typography-800 text-white border border-white/10 shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <svg className="w-6 h-6 flex-shrink-0 fill-white transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.78-.96 2.84 1.04.08 2.08-.52 2.72-1.3z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[10px] font-bold text-secondary-400 uppercase tracking-wider">
                    Coming Soon
                  </span>
                  <span className="block text-sm font-extrabold text-white">App Store</span>
                </div>
              </a>
            </HStack>
          </VStack>

          {/* 3 Bento Micro-Highlights Strip */}
          <div className="w-full max-w-lg grid grid-cols-3 gap-2.5 sm:gap-3 pt-2 animate-hero-up-3">
            {microHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white/90 backdrop-blur-sm border border-outline-200 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center sm:items-center gap-2 text-center sm:text-left shadow-xs hover:border-primary-500/40 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-extrabold text-typography-900 leading-tight truncate">
                      {item.title}
                    </span>
                    <span className="block text-[10px] font-medium text-typography-500 truncate mt-0.5">
                      {item.sub}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Interactive Mascot Greeting Card (Always Visible, Syncs with Mascots & Phone Pins) */}
          <Box className="w-full max-w-lg bg-white/95 backdrop-blur-md border border-outline-200 rounded-2xl p-3.5 shadow-sm flex items-center gap-3.5 text-left animate-hero-up-3">
            <div className={`w-11 h-11 rounded-2xl ${activeMascotBg} p-1.5 flex items-center justify-center flex-shrink-0`}>
              {selectedMascot === 'plop' && <MrPlopSVG className="w-8 h-8" />}
              {selectedMascot === 'drip' && <LilDripSVG className="w-8 h-8" />}
              {selectedMascot === 'flush' && <SirFlushSVG className="w-8 h-8" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary-500">
                  {activeMascotName} • {isEn ? 'Tap Mascot or Pin' : 'Klik Maskot / Pin Peta'}
                </span>
                <Volume2 className="w-3.5 h-3.5 text-typography-400 flex-shrink-0" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-typography-900 truncate mt-0.5">
                "{activeQuote}"
              </p>
            </div>
          </Box>
        </VStack>

        {/* ========================================= */}
        {/* RIGHT COLUMN: 3D STUDIO STAGE + IPHONE    */}
        {/* ========================================= */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="relative w-[345px] sm:w-[465px] h-[535px] sm:h-[600px] flex items-start justify-center pt-2">
            {/* Concentric Studio Halo Ring behind iPhone */}
            <div className="hidden sm:block absolute top-10 w-[390px] h-[390px] rounded-full border border-dashed border-outline-300/60 pointer-events-none" />
            <div className="absolute top-16 w-[310px] sm:w-[340px] h-[310px] sm:h-[340px] rounded-full bg-gradient-to-tr from-primary-500/15 via-secondary-500/12 to-[#FDE6C9]/40 blur-3xl pointer-events-none" />

            {/* Floating Glass Widget 1 (Left): Shield + 100% Lokal */}
            <div className="absolute left-0 sm:left-1 top-[39%] z-30 bg-white/95 backdrop-blur-md border border-outline-200 rounded-2xl px-3.5 py-2.5 shadow-bwa-float flex items-center gap-2.5 animate-chip-left">
              <div className="w-9 h-9 rounded-xl bg-secondary-0 text-secondary-500 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs sm:text-sm font-extrabold text-typography-900">
                  {isEn ? '100% Local' : '100% Lokal'}
                </span>
                <span className="block text-[10px] font-semibold text-typography-500 mt-0.5">
                  {isEn ? 'Encrypted SQLite' : 'SQLite Terenkripsi'}
                </span>
              </div>
            </div>

            {/* Floating Glass Widget 2 (Top-Right): Zap + Log Cepat! */}
            <div className="absolute right-0 sm:right-0 top-[11%] z-30 bg-white/95 backdrop-blur-md border border-outline-200 rounded-2xl px-3.5 py-2.5 shadow-bwa-float flex items-center gap-2.5 animate-chip-right">
              <div className="w-9 h-9 rounded-xl bg-primary-0 text-primary-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 fill-primary-500/20" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs sm:text-sm font-extrabold text-typography-900">
                  {isEn ? 'Fast Log!' : 'Log Cepat!'}
                </span>
                <span className="block text-[10px] font-semibold text-typography-500 mt-0.5">
                  {isEn ? '2-Tap • < 3 Sec' : '2-Tap • < 3 Detik'}
                </span>
              </div>
            </div>

            {/* Floating Glass Mini Pill 3 (Mid-Right): Streak Counter */}
            <div className="hidden sm:flex absolute right-1 top-[49%] z-30 bg-background-900 text-white border border-white/10 rounded-full px-3.5 py-2 shadow-xl items-center gap-2 animate-chip-mid">
              <Flame className="w-4 h-4 text-[#FBBF24] fill-[#FBBF24]" />
              <span className="text-xs font-extrabold tracking-tight">
                {isEn ? '5 Day Streak' : '5 Hari Streak'}
              </span>
            </div>

            {/* Interactive Titanium-Bezel iPhone 16 Pro Frame */}
            <div className="relative w-[272px] sm:w-[306px] h-[485px] sm:h-[545px] rounded-[3.1rem] border-[8px] border-[#0C102A] ring-1 ring-slate-300/60 bg-white shadow-[0_32px_70px_-15px_rgba(12,16,42,0.28)] overflow-hidden flex flex-col animate-phone-float">
              {/* Subtle Glass Diagonal Sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none z-20" />

              {/* iOS Status Bar + Dynamic Island */}
              <div className="relative pt-3 pb-1 px-6 bg-white flex items-center justify-between z-20">
                <span className="text-[11px] font-bold text-[#0C102A]">9:41</span>
                <div className="w-24 h-5 bg-[#0C102A] rounded-full flex items-center justify-end px-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-1 text-[#0C102A]">
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>

              {/* Navigation Header: "< Personal Map" */}
              <div className="pt-1 pb-2.5 px-4 bg-white border-b border-outline-100 flex items-center justify-between z-20">
                <ChevronLeft className="w-4 h-4 text-typography-900" />
                <span className="text-xs font-extrabold text-typography-900">Personal Map</span>
                <span className="text-[9px] font-extrabold text-secondary-500 bg-secondary-0 px-2 py-0.5 rounded-full">
                  GPS
                </span>
              </div>

              {/* Bright Pastel Interactive Map Canvas */}
              <div className="relative flex-1 bg-[#F5F4EE] overflow-hidden">
                <svg
                  viewBox="0 0 300 440"
                  className="w-full h-full object-cover"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <rect width="300" height="440" fill="#F5F4EE" />

                  {/* Soft Mint Green Parks */}
                  <path d="M120 0 L300 0 L300 135 L205 160 L155 75 Z" fill="#C9F2D4" />
                  <path d="M0 115 L75 235 L110 340 L0 365 Z" fill="#C9F2D4" />
                  <path d="M195 230 L300 205 L300 325 L215 305 Z" fill="#C9F2D4" />

                  {/* Sky Blue Water / River */}
                  <path d="M0 175 L58 290 L135 330 L300 275 L300 325 L135 380 L0 395 Z" fill="#9EDAFB" />

                  {/* Crisp White Street Grid */}
                  <path d="M0 80 L300 145" stroke="#FFFFFF" strokeWidth="10" />
                  <path d="M90 0 L175 440" stroke="#FFFFFF" strokeWidth="11" />
                  <path d="M225 0 L125 255 L295 340" stroke="#FFFFFF" strokeWidth="9" fill="none" />
                  <path d="M0 215 L300 145" stroke="#FFFFFF" strokeWidth="8" />
                  <path d="M40 0 L15 240" stroke="#FFFFFF" strokeWidth="7" />
                  <path d="M150 55 L260 40" stroke="#FFFFFF" strokeWidth="6" />
                  <path d="M35 150 L185 118" stroke="#FFFFFF" strokeWidth="6" />
                </svg>

                {/* 4 Interactive Clickable 3D Mascot Pins */}
                {HERO_PINS.map((pin) => {
                  const isSelected = selectedPinId === pin.id;
                  return (
                    <button
                      type="button"
                      key={pin.id}
                      onClick={() => handleSelectMascot(pin.mascot, pin.id)}
                      style={{ top: pin.top, left: pin.left, right: pin.right }}
                      className={`absolute flex flex-col items-center transition-all duration-300 z-10 cursor-pointer focus:outline-none ${
                        isSelected
                          ? 'scale-115 z-20'
                          : pin.delayed
                          ? 'animate-pin-pulse-delayed hover:scale-110'
                          : 'animate-pin-pulse hover:scale-110'
                      }`}
                      title={pin.place}
                    >
                      <div
                        className={`w-12 h-12 rounded-full ${pin.bg} p-1.5 border-2 shadow-md flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-primary-500 ring-4 ring-primary-500/25 shadow-lg'
                            : 'border-white'
                        }`}
                      >
                        {pin.mascot === 'plop' && <MrPlopSVG className="w-8 h-8" />}
                        {pin.mascot === 'drip' && <LilDripSVG className="w-8 h-8" />}
                        {pin.mascot === 'flush' && <SirFlushSVG className="w-8 h-8" />}
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full ${pin.dot} border-2 border-white shadow-xs mt-0.5`} />
                    </button>
                  );
                })}

                {/* Floating Map Controls on Right */}
                <div className="absolute right-3 bottom-24 flex flex-col gap-2 z-10">
                  <div className="w-8 h-8 rounded-full bg-white shadow-md border border-outline-100 flex items-center justify-center text-typography-900">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white shadow-md border border-outline-100 flex items-center justify-center text-primary-500">
                    <Navigation className="w-4 h-4 fill-current" />
                  </div>
                </div>

                {/* Live Interactive In-Phone Glass Notification Banner */}
                <div
                  key={activePin.id}
                  className="absolute bottom-14 inset-x-3 z-20 bg-white/95 backdrop-blur-md border border-outline-200 rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2.5 animate-fadeIn"
                >
                  <div className={`w-8 h-8 rounded-xl ${activePin.bg} p-1 flex items-center justify-center flex-shrink-0`}>
                    {activePin.mascot === 'plop' && <MrPlopSVG className="w-6 h-6" />}
                    {activePin.mascot === 'drip' && <LilDripSVG className="w-6 h-6" />}
                    {activePin.mascot === 'flush' && <SirFlushSVG className="w-6 h-6" />}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-extrabold text-typography-900 truncate">
                        {isEn ? activePin.moodEn : activePin.moodId}
                      </span>
                      <span className="text-[9px] font-semibold text-typography-400 flex-shrink-0">
                        {activePin.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-semibold text-typography-500 truncate">
                      <MapPin className="w-2.5 h-2.5 text-secondary-500 flex-shrink-0" />
                      <span className="truncate">{activePin.place}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Bottom Bar Peek inside Phone */}
              <div className="h-11 bg-white border-t border-outline-100 px-6 flex items-center justify-between">
                <div className="w-6 h-1.5 rounded-full bg-primary-500/40" />
                <div className="w-20 h-1 rounded-full bg-[#0C102A]/20" />
                <div className="w-6 h-1.5 rounded-full bg-outline-200" />
              </div>
            </div>

            {/* Animated 3D Mascot Trio v2 Standing Proudly in Foreground */}
            <div className="absolute bottom-0 inset-x-0 flex items-end justify-center gap-0 sm:gap-2 z-30 pointer-events-none">
              {/* 1. Mr. Plop (Left) */}
              <div className="flex flex-col items-center -mr-2 sm:-mr-1 group">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity -mb-1 text-[10px] font-extrabold text-typography-900 bg-white/95 border border-outline-200 px-2.5 py-0.5 rounded-full shadow-xs">
                  Mr. Plop
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectMascot('plop')}
                  title="Mr. Plop — Tap me!"
                  className={`pointer-events-auto w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-300 hover:scale-110 hover:-rotate-3 active:scale-95 focus:outline-none ${
                    bouncingMascot === 'plop' ? 'mascot-bounce-wiggle' : 'animate-mascot-1'
                  }`}
                >
                  <MrPlopSVG className="w-full h-full drop-shadow-xl" />
                </button>
                <div className="w-16 h-2.5 rounded-full bg-[#0C102A]/20 blur-[3px] -mt-2 animate-shadow-1" />
              </div>

              {/* 2. Lil' Drip (Center Front) */}
              <div className="flex flex-col items-center z-10 translate-y-1 group">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity -mb-1 text-[10px] font-extrabold text-typography-900 bg-white/95 border border-outline-200 px-2.5 py-0.5 rounded-full shadow-xs">
                  Lil&apos; Drip
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectMascot('drip')}
                  title="Lil' Drip — Tap me!"
                  className={`pointer-events-auto w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none ${
                    bouncingMascot === 'drip' ? 'mascot-bounce-wiggle' : 'animate-mascot-2'
                  }`}
                >
                  <LilDripSVG className="w-full h-full drop-shadow-xl" />
                </button>
                <div className="w-14 h-2.5 rounded-full bg-[#0C102A]/20 blur-[3px] -mt-2 animate-shadow-2" />
              </div>

              {/* 3. Sir Flush (Right) */}
              <div className="flex flex-col items-center -ml-2 sm:-ml-1 group">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity -mb-1 text-[10px] font-extrabold text-typography-900 bg-white/95 border border-outline-200 px-2.5 py-0.5 rounded-full shadow-xs">
                  Sir Flush
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectMascot('flush')}
                  title="Sir Flush — Tap me!"
                  className={`pointer-events-auto w-32 h-32 sm:w-36 sm:h-36 transition-transform duration-300 hover:scale-110 hover:rotate-3 active:scale-95 focus:outline-none ${
                    bouncingMascot === 'flush' ? 'mascot-bounce-wiggle' : 'animate-mascot-3'
                  }`}
                >
                  <SirFlushSVG className="w-full h-full drop-shadow-xl" />
                </button>
                <div className="w-16 h-2.5 rounded-full bg-[#0C102A]/20 blur-[3px] -mt-2 animate-shadow-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
