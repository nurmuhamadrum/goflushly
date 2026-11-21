import React, { useState } from 'react';
import { ChevronLeft, Navigation, Layers, Wifi, Battery } from 'lucide-react';
import { MrPlopSVG, LilDripSVG, SirFlushSVG } from './MascotSVGs';
import { Box, VStack, HStack, Heading, Text, Button, ButtonText } from './ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useWebCopy } from '../i18n/translations';
import { playMascotSound } from '../utils/mascotSound';

type ActiveMascot = 'plop' | 'drip' | 'flush';

export const HeroSection: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const t = useWebCopy(lang).hero;

  const [activeMascot, setActiveMascot] = useState<ActiveMascot | null>(null);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);

  const handleMascotTap = (mascot: ActiveMascot) => {
    playMascotSound(mascot);
    setActiveMascot(mascot);
    const quote = mascot === 'plop' ? t.plopQuote : mascot === 'drip' ? t.dripQuote : t.flushQuote;
    setSpeechBubble(quote);
    setTimeout(() => setActiveMascot(null), 850);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-24 bg-background-50">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-center">
        {/* Left Column: Clean Gluestack Editorial Typography */}
        <VStack space="lg" className="lg:col-span-6 text-center lg:text-left z-10 items-center lg:items-start">
          <Text
            size="md"
            bold
            className="text-secondary-500 tracking-tight animate-hero-up"
          >
            {isEn ? '100% Offline-First & Private' : '100% Offline-First & Privat'}
          </Text>

          <Heading
            as="h1"
            size="4xl"
            className="animate-hero-up-1"
          >
            Track. Log.
            <br />
            Lega.
          </Heading>

          <Text
            size="md"
            className="sm:text-lg text-typography-600 max-w-md leading-relaxed animate-hero-up-2"
          >
            {isEn
              ? 'Your personal daily poop & pee lifelogger. Fast, cute, ad-free, and stored 100% privately on your device.'
              : 'Catatan harian BAB & BAK pribadimu. Cepat, lucu, bebas iklan, dan 100% hanya tersimpan di perangkatmu.'}
          </Text>

          {/* Gluestack Pill Buttons */}
          <HStack space="md" className="pt-2 flex-wrap justify-center lg:justify-start animate-hero-up-3">
            <Button href="#preview" action="primary" size="lg">
              <ButtonText>{isEn ? 'Try Interactive Demo' : 'Coba Demo Interaktif'}</ButtonText>
            </Button>
            <Button href="#download" action="neutral" size="lg">
              <ButtonText>{isEn ? 'Coming Soon on iOS & Android' : 'Segera di iOS & Android'}</ButtonText>
            </Button>
          </HStack>

          {/* Interactive Mascot Quote Pill */}
          {speechBubble && (
            <Box className="inline-flex items-center gap-2.5 bg-background-0 border border-outline-200 px-4 py-2.5 rounded-2xl shadow-sm text-xs font-semibold text-typography-900 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
              <span>"{speechBubble}"</span>
            </Box>
          )}
        </VStack>

        {/* Right Column: Large Realistic iPhone Mockup + Floating Chips + Animated 3D Mascot Trio */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end z-10">
          <div className="relative w-[340px] sm:w-[440px] h-[515px] sm:h-[580px] flex items-start justify-center pt-2">
            {/* Soft Ambient Background Glow */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-primary-500/10 via-secondary-500/10 to-[#FBBF24]/10 blur-3xl pointer-events-none" />

            {/* Floating Glass Card Left: "100% Lokal" (Overlapping Left Bezel like Reference) */}
            <div className="absolute left-1 sm:left-4 top-[42%] z-30 bg-white/95 backdrop-blur-md border border-outline-200/80 rounded-2xl px-4 py-3 shadow-bwa-float text-center animate-chip-left">
              <span className="block text-sm sm:text-base font-extrabold text-typography-900 leading-tight">
                100%
              </span>
              <span className="block text-sm sm:text-base font-extrabold text-typography-900 leading-tight">
                {isEn ? 'Local' : 'Lokal'}
              </span>
            </div>

            {/* Floating Glass Card Top-Right: "Log Cepat!" (Overlapping Right Bezel like Reference) */}
            <div className="absolute right-1 sm:right-3 top-[13%] z-30 bg-white/95 backdrop-blur-md border border-outline-200/80 rounded-2xl px-4 py-3 shadow-bwa-float text-center animate-chip-right">
              <span className="block text-sm sm:text-base font-extrabold text-typography-900 leading-tight">
                {isEn ? 'Fast' : 'Log'}
              </span>
              <span className="block text-sm sm:text-base font-extrabold text-typography-900 leading-tight">
                {isEn ? 'Log!' : 'Cepat!'}
              </span>
            </div>

            {/* Large Proportioned iPhone 16 Pro Frame (Matches Attached Reference Size) */}
            <div className="relative w-[268px] sm:w-[300px] h-[475px] sm:h-[535px] rounded-[3rem] border-[8px] border-[#0C102A] bg-white shadow-2xl overflow-hidden flex flex-col animate-phone-float">
              {/* iOS Status Bar + Dynamic Island */}
              <div className="relative pt-3 pb-1 px-6 bg-white flex items-center justify-between z-20">
                <span className="text-[11px] font-bold text-[#0C102A]">9:41</span>
                <div className="w-24 h-5 bg-[#0C102A] rounded-full" />
                <div className="flex items-center gap-1 text-[#0C102A]">
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>

              {/* Navigation Header: "< Personal Map" */}
              <div className="pt-1 pb-2.5 px-4 bg-white border-b border-outline-100 flex items-center justify-between z-20">
                <ChevronLeft className="w-4 h-4 text-typography-900" />
                <span className="text-xs font-extrabold text-typography-900">Personal Map</span>
                <span className="w-4" />
              </div>

              {/* Bright Pastel City Map Canvas (Exact Reference Style) */}
              <div className="relative flex-1 bg-[#F6F5F0] overflow-hidden">
                <svg
                  viewBox="0 0 300 440"
                  className="w-full h-full object-cover"
                  preserveAspectRatio="xMidYMid slice"
                >
                  {/* Clean Off-White City Blocks */}
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

                {/* Pin 1 (Top-Left): Mr. Plop in Warm Peach Circle + Gold Dot */}
                <div className="absolute top-[7%] left-[18%] flex flex-col items-center animate-pin-pulse">
                  <div className="w-12 h-12 rounded-full bg-[#FDE6C9] p-1.5 border-2 border-white shadow-md flex items-center justify-center">
                    <MrPlopSVG className="w-8 h-8" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] border-2 border-white shadow-xs mt-0.5" />
                </div>

                {/* Pin 2 (Upper-Right): Sir Flush in Soft Sky Circle + Blue Dot */}
                <div className="absolute top-[22%] right-[13%] flex flex-col items-center animate-pin-pulse-delayed">
                  <div className="w-12 h-12 rounded-full bg-[#D4F0FF] p-1.5 border-2 border-white shadow-md flex items-center justify-center">
                    <SirFlushSVG className="w-8 h-8" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white shadow-xs mt-0.5" />
                </div>

                {/* Pin 3 (Center): Lil' Drip in Warm Peach Circle + Gold Dot */}
                <div className="absolute top-[41%] left-[41%] flex flex-col items-center animate-pin-pulse">
                  <div className="w-12 h-12 rounded-full bg-[#FDE6C9] p-1.5 border-2 border-white shadow-md flex items-center justify-center">
                    <LilDripSVG className="w-8 h-8" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] border-2 border-white shadow-xs mt-0.5" />
                </div>

                {/* Pin 4 (Lower-Left): Lil' Drip in Soft Sky Circle + Blue Dot */}
                <div className="absolute top-[60%] left-[12%] flex flex-col items-center animate-pin-pulse-delayed">
                  <div className="w-12 h-12 rounded-full bg-[#D4F0FF] p-1.5 border-2 border-white shadow-md flex items-center justify-center">
                    <LilDripSVG className="w-8 h-8" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white shadow-xs mt-0.5" />
                </div>

                {/* Floating Map Controls on Bottom Right */}
                <div className="absolute right-3 bottom-16 flex flex-col gap-2 z-10">
                  <div className="w-8 h-8 rounded-full bg-white shadow-md border border-outline-100 flex items-center justify-center text-typography-900">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white shadow-md border border-outline-100 flex items-center justify-center text-typography-900">
                    <Navigation className="w-4 h-4" />
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

            {/* Animated 3D Mascot Trio Standing Proudly in Front of Phone Bottom */}
            <div className="absolute bottom-0 inset-x-0 flex items-end justify-center gap-0 sm:gap-2 z-30 pointer-events-none">
              {/* 1. Mr. Plop (Left) */}
              <div className="flex flex-col items-center -mr-2 sm:-mr-1">
                <button
                  type="button"
                  onClick={() => handleMascotTap('plop')}
                  title="Mr. Plop — Tap me!"
                  className={`pointer-events-auto w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-300 hover:scale-110 hover:-rotate-3 active:scale-95 focus:outline-none ${
                    activeMascot === 'plop' ? 'mascot-bounce-wiggle' : 'animate-mascot-1'
                  }`}
                >
                  <MrPlopSVG className="w-full h-full drop-shadow-xl" />
                </button>
                <div className="w-16 h-2.5 rounded-full bg-[#0C102A]/20 blur-[3px] -mt-2 animate-shadow-1" />
              </div>

              {/* 2. Lil' Drip (Center Front) */}
              <div className="flex flex-col items-center z-10 translate-y-1">
                <button
                  type="button"
                  onClick={() => handleMascotTap('drip')}
                  title="Lil' Drip — Tap me!"
                  className={`pointer-events-auto w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none ${
                    activeMascot === 'drip' ? 'mascot-bounce-wiggle' : 'animate-mascot-2'
                  }`}
                >
                  <LilDripSVG className="w-full h-full drop-shadow-xl" />
                </button>
                <div className="w-14 h-2.5 rounded-full bg-[#0C102A]/20 blur-[3px] -mt-2 animate-shadow-2" />
              </div>

              {/* 3. Sir Flush (Right) */}
              <div className="flex flex-col items-center -ml-2 sm:-ml-1">
                <button
                  type="button"
                  onClick={() => handleMascotTap('flush')}
                  title="Sir Flush — Tap me!"
                  className={`pointer-events-auto w-32 h-32 sm:w-36 sm:h-36 transition-transform duration-300 hover:scale-110 hover:rotate-3 active:scale-95 focus:outline-none ${
                    activeMascot === 'flush' ? 'mascot-bounce-wiggle' : 'animate-mascot-3'
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
