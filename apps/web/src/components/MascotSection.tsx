import React, { useState } from 'react';
import { Sparkles, Volume2, Clock, Droplets, ShieldCheck } from 'lucide-react';
import { Card, Heading, Text, Badge, BadgeText, VStack } from './ui';
import { useLanguage } from '../i18n/LanguageContext';
import { playMascotSound } from '../utils/mascotSound';

type MascotKey = 'plop' | 'drip' | 'flush';

export const MascotSection: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [activeSpeech, setActiveSpeech] = useState<Record<MascotKey, string | null>>({
    plop: null,
    drip: null,
    flush: null,
  });
  const [tappedMascot, setTappedMascot] = useState<MascotKey | null>(null);

  const handleTap = (mascot: MascotKey) => {
    playMascotSound(mascot);
    setTappedMascot(mascot);
    setTimeout(() => setTappedMascot(null), 900);

    const quotes: Record<MascotKey, string[]> = {
      plop: isEn
        ? ['Plop! Belly feels super light today!', 'Bristol Type 4: Smooth perfection!', '3-second logging, zero awkwardness!']
        : ['Plong! Perut auto enteng hari ini!', 'Bristol Tipe 4: Sempurna!', 'Catat 3 detik, tanpa rasa canggung!'],
      drip: isEn
        ? ['Stay hydrated, drink 2L of water!', '1-tap pee log, super refreshing!', 'Clear pale yellow = Hydration champion!']
        : ['Jangan lupa minum 2 liter air ya!', 'Catat BAK 1-tap, segar dan cepat!', 'Hidrasi terjaga, tubuh makin bugar!'],
      flush: isEn
        ? ['Whoosh! 100% locked locally!', 'Combo mission accomplished!', 'Zero social feeds, 100% private!']
        : ['Wuuusshhh! 100% aman di perangkatmu!', 'Misi kombo BAB & BAK tuntas!', 'Tanpa sosial media, 100% rahasia!'],
    };

    const list = quotes[mascot];
    const random = list[Math.floor(Math.random() * list.length)];
    setActiveSpeech((prev) => ({ ...prev, [mascot]: random }));
  };

  const cards = [
    {
      key: 'plop' as MascotKey,
      name: 'Mr. Plop',
      role: isEn ? 'The Daily Anchor' : 'Sahabat BAB Harian',
      desc: isEn
        ? 'Friendly, snappy daily bowel movement tracker with Bristol Stool Scale precision.'
        : 'Pencatat log BAB harian yang ramah, cepat 3-detik dengan skala visual Bristol.',
      badge: isEn ? 'Poop Log' : 'Log BAB',
      icon: Clock,
      microStat: isEn ? '< 3 Sec Log' : 'Catat < 3 Detik',
      thumbBg: 'from-[#FFF7ED] to-[#FFEDD5]',
      glowColor: 'bg-amber-400/20',
      imageSrc: '/mascots/mr-plop.png',
    },
    {
      key: 'drip' as MascotKey,
      name: "Lil' Drip",
      role: isEn ? 'The Hydration Hero' : 'Pahlawan Hidrasi',
      desc: isEn
        ? 'Daily urination tracker that monitors hydration color and encourages mindful fluid intake.'
        : 'Penjaga log BAK harian yang memantau warna hidrasi dan pengingat cukup minum air.',
      badge: isEn ? 'Pee Log' : 'Log BAK',
      icon: Droplets,
      microStat: isEn ? '2L Water Goal' : 'Target 2L Air',
      thumbBg: 'from-[#F0F9FF] to-[#E0F2FE]',
      glowColor: 'bg-sky-400/20',
      imageSrc: '/mascots/lil-drip.png',
    },
    {
      key: 'flush' as MascotKey,
      name: 'Sir Flush',
      role: isEn ? 'The Privacy Sentinel' : 'Ksatria Privasi & Stats',
      desc: isEn
        ? 'Guardian of your weekly digestive combos, offline clusters, and 100% local database.'
        : 'Penjaga kombo BAB & BAK mingguan, clustering peta toilet, dan privasi 100% offline.',
      badge: isEn ? 'Stats & Combo' : 'Kombo & Stats',
      icon: ShieldCheck,
      microStat: isEn ? '100% Local DB' : '100% Database Lokal',
      thumbBg: 'from-[#F0FDF4] to-[#DCFCE7]',
      glowColor: 'bg-emerald-400/20',
      imageSrc: '/mascots/sir-flush.png',
    },
  ];

  return (
    <section id="maskot" className="py-20 md:py-28 bg-background-50 relative overflow-hidden">
      {/* Subtle background ambient circles */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        <VStack space="sm" className="text-center max-w-2xl mx-auto mb-14 items-center">
          <Badge action="secondary" size="lg" className="shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <BadgeText>{isEn ? 'Meet the Mascots' : 'Kenalan Dengan Maskot'}</BadgeText>
          </Badge>
          <Heading as="h2" size="2xl" className="text-typography-900 font-extrabold tracking-tight">
            {isEn ? 'Your Digestive Companion Trio' : 'Trio Sahabat Pencernaanmu'}
          </Heading>
          <Text size="sm" className="text-typography-600 max-w-lg leading-relaxed">
            {isEn
              ? 'Tap any mascot below to hear them cheer you on and explore their unique superpowers!'
              : 'Sentuh salah satu maskot di bawah untuk mendengar suara dan celoteh motivasi mereka!'}
          </Text>
        </VStack>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {cards.map((card) => {
            const isTapped = tappedMascot === card.key;
            const quote = activeSpeech[card.key];
            const StatIcon = card.icon;

            return (
              <Card
                key={card.key}
                variant={isTapped ? 'highlighted' : 'elevated'}
                size="sm"
                onClick={() => handleTap(card.key)}
                className="group hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between rounded-3xl p-5 border border-outline-100 hover:border-primary-300 hover:shadow-xl bg-white relative overflow-hidden"
              >
                <div>
                  {/* 3D Showcase Stage */}
                  <div
                    className={`h-56 rounded-2xl bg-gradient-to-b ${card.thumbBg} flex items-center justify-center p-4 relative overflow-hidden shadow-inner`}
                  >
                    {/* Ambient Radial Glow */}
                    <div
                      className={`absolute w-36 h-36 rounded-full ${card.glowColor} blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-125`}
                    />

                    {/* 3D Mascot Image with Bounce/Scale */}
                    <div
                      className={`relative z-10 transition-transform duration-300 group-hover:scale-105 ${
                        isTapped ? 'mascot-bounce-wiggle' : ''
                      }`}
                    >
                      <img
                        src={card.imageSrc}
                        alt={card.name}
                        className="w-40 h-40 object-contain drop-shadow-lg select-none pointer-events-none"
                        loading="lazy"
                      />
                    </div>

                    {/* Sound Hint Pill */}
                    <span className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md flex items-center gap-1.5 text-[11px] font-bold text-typography-700 opacity-90 group-hover:opacity-100 transition-opacity shadow-xs border border-white/60">
                      <Volume2 className="w-3.5 h-3.5 text-primary-500" />
                      <span>{isEn ? 'Tap me' : 'Sentuh'}</span>
                    </span>

                    {/* Floating Speech Bubble */}
                    {quote && (
                      <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md border border-primary-200/80 rounded-2xl px-3.5 py-2 text-[12px] font-extrabold text-typography-900 text-center shadow-lg animate-fadeIn z-20">
                        "{quote}"
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="px-1 pt-5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <Heading as="h3" size="lg" className="font-extrabold text-typography-900">
                        {card.name}
                      </Heading>
                      <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
                        {card.role}
                      </span>
                    </div>

                    <Text size="sm" className="text-typography-600 leading-relaxed min-h-[44px]">
                      {card.desc}
                    </Text>
                  </div>
                </div>

                {/* Footer Micro-Bar */}
                <div className="pt-5 mt-4 border-t border-outline-100 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-typography-700 bg-background-50 px-2.5 py-1 rounded-lg border border-outline-100">
                    <StatIcon className="w-3.5 h-3.5 text-secondary-500" />
                    <span>{card.microStat}</span>
                  </div>

                  <Badge action="muted" size="md" className="font-bold">
                    <BadgeText>{card.badge}</BadgeText>
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
