import React from 'react';
import { WifiOff, Lock, Ban, FileJson, ShieldCheck } from 'lucide-react';
import { Card, VStack, Heading, Text, Button, ButtonText } from './ui';
import { useLanguage } from '../i18n/LanguageContext';

export const PrivacyManifesto: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const pillars = [
    {
      icon: WifiOff,
      label: 'Offline-First',
      desc: isEn ? 'No server sync required' : 'Berjalan tanpa internet',
    },
    {
      icon: Lock,
      label: isEn ? 'Biometric Lock' : 'Kunci Biometrik',
      desc: isEn ? 'FaceID & fingerprint guard' : 'FaceID & sidik jari aman',
    },
    {
      icon: Ban,
      label: isEn ? 'Zero Ads' : '100% Tanpa Iklan',
      desc: isEn ? 'No third-party trackers' : 'Nol pelacak komersial',
    },
    {
      icon: FileJson,
      label: isEn ? 'JSON Data Export' : 'Ekspor JSON Bebas',
      desc: isEn ? 'Own your health records' : 'Data milikmu sepenuhnya',
    },
  ];

  return (
    <section id="privasi" className="py-16 md:py-24 bg-background-50 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <Card
          variant="navy"
          size="xl"
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-slate-700/60 shadow-2xl bg-gradient-to-br from-[#0C102A] via-[#11183E] to-[#0A0D22]"
        >
          {/* Ambient Cyber Glow Orbs */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-500/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-secondary-500/20 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Content */}
            <VStack space="md" className="lg:col-span-6 text-center lg:text-left items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-500/10 border border-secondary-500/30 text-secondary-400 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-secondary-400" />
                <span>{isEn ? 'Uncompromising Privacy' : 'Privasi Tanpa Kompromi'}</span>
              </div>

              <Heading as="h2" size="2xl" className="text-white leading-tight font-black tracking-tight">
                {isEn
                  ? '100% Local Privacy. Not a Public Toilet Reviewer.'
                  : '100% Privasi Lokal. Bukan Pencari Toilet Umum.'}
              </Heading>

              <Text size="sm" className="text-slate-300 leading-relaxed max-w-md">
                {isEn
                  ? 'Your biological events stay strictly locked inside your physical smartphone memory with zero analytics telemetry or public social feeds.'
                  : 'Semua rekaman tersimpan eksklusif di memori fisik ponselmu. Tanpa server pihak ketiga, tanpa telemetri analitik, dan tanpa feed sosial publik.'}
              </Text>

              <div className="pt-2">
                <Button href="#faq" action="primary" size="md" className="rounded-xl px-6 py-2.5 shadow-md">
                  <ButtonText className="font-bold">{isEn ? 'Learn More About Security' : 'Pelajari Keamanan & Privasi'}</ButtonText>
                </Button>
              </div>
            </VStack>

            {/* Right Pillars Glass Cards */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-3.5 sm:gap-4">
              {pillars.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-white/30 hover:bg-white/15 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2.5 shadow-lg group hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="block text-sm font-extrabold text-white leading-tight">
                        {item.label}
                      </span>
                      <span className="block text-[11px] text-slate-300/80 mt-1">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
