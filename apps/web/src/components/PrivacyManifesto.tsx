import React from 'react';
import { WifiOff, Lock, Ban, FileJson } from 'lucide-react';
import { Card, VStack, Heading, Text, Button, ButtonText } from './ui';
import { useLanguage } from '../i18n/LanguageContext';

export const PrivacyManifesto: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const pillars = [
    { icon: WifiOff, label: 'Offline-First' },
    { icon: Lock, label: isEn ? 'Biometric Lock' : 'Kunci Biometrik' },
    { icon: Ban, label: isEn ? 'Zero Ads' : 'Tanpa Iklan' },
    { icon: FileJson, label: isEn ? 'JSON Data Export' : 'Ekspor Data JSON' },
  ];

  return (
    <section id="privasi" className="py-12 md:py-16 bg-background-50">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <Card variant="navy" size="xl" className="relative overflow-hidden">
          <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-secondary-500/15 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
            <VStack space="md" className="lg:col-span-6 text-center lg:text-left items-center lg:items-start">
              <Text size="sm" bold className="text-secondary-500">
                {isEn ? 'Uncompromising Privacy' : 'Privasi Tanpa Kompromi'}
              </Text>

              <Heading as="h2" size="2xl" className="text-white leading-tight">
                {isEn
                  ? '100% Local Privacy. Not a Public Toilet Finder.'
                  : '100% Privasi Lokal. Bukan Pencari Toilet Umum.'}
              </Heading>

              <Text size="sm" className="text-typography-400 leading-relaxed max-w-md">
                {isEn
                  ? 'All your personal records stay exclusively on your device with zero third-party ad trackers or social oversharing.'
                  : 'Semua catatan tersimpan eksklusif di perangkatmu tanpa server pelacak iklan maupun feed sosial.'}
              </Text>

              <div className="pt-2">
                <Button href="#faq" action="primary" size="md">
                  <ButtonText>{isEn ? 'Learn About Privacy' : 'Pelajari Privasi'}</ButtonText>
                </Button>
              </div>
            </VStack>

            <div className="lg:col-span-6 grid grid-cols-2 gap-3.5 sm:gap-4">
              {pillars.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.label}
                    variant="outline"
                    size="md"
                    className="rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1"
                  >
                    <Icon className="w-7 h-7 text-typography-900 stroke-[2.2]" />
                    <Text as="span" size="sm" bold className="text-typography-900 leading-tight">
                      {item.label}
                    </Text>
                  </Card>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
