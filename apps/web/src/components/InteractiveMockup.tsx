import React, { useState } from 'react';
import { PhoneMockup, MockupScreen } from './PhoneMockup';
import { MapPin, Calendar, Zap, Smile, Sparkles } from 'lucide-react';
import { Badge, BadgeText, Heading, Text, Button, ButtonText, HStack, VStack } from './ui';
import { useLanguage } from '../i18n/LanguageContext';

export const InteractiveMockup: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<MockupScreen>('map');
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const tabs: { id: MockupScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'map', label: isEn ? '1. Personal Map' : '1. Peta Pribadi', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'quick-log', label: isEn ? '2. Quick Log (3 Sec)' : '2. Quick Log (3 Detik)', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'mood', label: '3. Mood Sheet', icon: <Smile className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: '4. Diary & Stats', icon: <Calendar className="w-3.5 h-3.5" /> },
  ];

  return (
    <section id="preview" className="py-16 md:py-24 border-b border-outline-100 bg-background-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <VStack space="sm" className="text-center max-w-2xl mx-auto mb-10 items-center">
          <Badge action="secondary" size="lg">
            <Sparkles className="w-3.5 h-3.5" />
            <BadgeText>Interactive Simulator</BadgeText>
          </Badge>
          <Heading as="h2" size="2xl">
            {isEn ? 'Try the App Right on Screen' : 'Coba Aplikasi Langsung di Layar'}
          </Heading>
          <Text size="sm" className="leading-relaxed">
            {isEn
              ? "Select a tab below or tap buttons inside the phone simulator to experience Poop Pee Log's snappy flow."
              : 'Pilih menu di bawah atau sentuh tombol di dalam layar HP simulasi untuk merasakan alur sat-set Poop Pee Log.'}
          </Text>

          <HStack space="sm" className="flex-wrap justify-center pt-4">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                action={activeScreen === tab.id ? 'primary' : 'white'}
                onClick={() => setActiveScreen(tab.id)}
              >
                {tab.icon}
                <ButtonText>{tab.label}</ButtonText>
              </Button>
            ))}
          </HStack>
        </VStack>

        {/* Simulator Frame Component */}
        <div className="flex justify-center">
          <PhoneMockup currentScreen={activeScreen} onScreenChange={setActiveScreen} />
        </div>
      </div>
    </section>
  );
};
