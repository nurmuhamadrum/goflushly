import React, { useState } from 'react';
import { MrPlopSVG, LilDripSVG, SirFlushSVG } from './MascotSVGs';
import { Star, Volume2 } from 'lucide-react';
import { Card, Heading, Text, Badge, BadgeText, HStack, VStack } from './ui';
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
      desc: isEn
        ? 'Friendly and fast daily bowel movement tracker.'
        : 'Pencatat log BAB harian yang ramah dan cepat.',
      badge: isEn ? 'Poop Log' : 'Log BAB',
      thumbBg: 'bg-[#FDE6C9]',
      renderMascot: () => <MrPlopSVG className="w-36 h-36" />,
    },
    {
      key: 'drip' as MascotKey,
      name: "Lil' Drip",
      desc: isEn
        ? 'Daily urination tracker to keep your hydration on point.'
        : 'Penjaga log BAK agar hidrasi harian tetap terjaga.',
      badge: isEn ? 'Pee Log' : 'Log BAK',
      thumbBg: 'bg-[#D4F0FF]',
      renderMascot: () => <LilDripSVG className="w-36 h-36" />,
    },
    {
      key: 'flush' as MascotKey,
      name: 'Sir Flush',
      desc: isEn
        ? 'Guardian of your weekly stats, combos, and local privacy.'
        : 'Penjaga statistik mingguan dan privasi lokalmu.',
      badge: isEn ? 'Stats' : 'Statistik',
      thumbBg: 'bg-[#C6F6E2]',
      renderMascot: () => <SirFlushSVG className="w-36 h-36" />,
    },
  ];

  return (
    <section id="maskot" className="py-16 md:py-24 bg-background-50">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <VStack space="sm" className="text-center max-w-2xl mx-auto mb-12 items-center">
          <Text size="sm" bold className="text-secondary-500">
            {isEn ? 'Meet the Mascots' : 'Kenalan Dengan Maskot'}
          </Text>
          <Heading as="h2" size="2xl">
            {isEn ? 'Your Digestive Companion Trio' : 'Trio Sahabat Pencernaanmu'}
          </Heading>
        </VStack>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const isTapped = tappedMascot === card.key;
            const quote = activeSpeech[card.key];
            return (
              <Card
                key={card.key}
                variant={isTapped ? 'highlighted' : 'elevated'}
                size="sm"
                onClick={() => handleTap(card.key)}
                className="group hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`h-48 rounded-2xl ${card.thumbBg} flex items-center justify-center p-4 relative overflow-hidden`}
                  >
                    <div
                      className={`transition-transform duration-300 group-hover:scale-110 ${
                        isTapped ? 'mascot-bounce-wiggle' : ''
                      }`}
                    >
                      {card.renderMascot()}
                    </div>

                    <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-typography-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                      <Volume2 className="w-3.5 h-3.5" />
                    </span>

                    {quote && (
                      <div className="absolute bottom-2.5 inset-x-3 bg-white/95 backdrop-blur-sm border border-outline-200 rounded-xl px-3 py-1.5 text-[11px] font-bold text-typography-900 text-center shadow-sm animate-fadeIn">
                        "{quote}"
                      </div>
                    )}
                  </div>

                  <div className="px-2 pt-4">
                    <Heading as="h3" size="md">
                      {card.name}
                    </Heading>
                    <Text size="sm" className="mt-1 leading-relaxed min-h-[40px]">
                      {card.desc}
                    </Text>
                  </div>
                </div>

                <HStack className="px-2 pt-4 pb-1 justify-between">
                  <HStack space="xs" className="gap-0.5 text-[#FBBF24]">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                    ))}
                  </HStack>
                  <Badge action="muted" size="md">
                    <BadgeText>{card.badge}</BadgeText>
                  </Badge>
                </HStack>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
