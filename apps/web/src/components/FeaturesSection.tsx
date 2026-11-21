import React from 'react';
import { Zap, MapPin, Flame, Sparkles, CheckCircle2, Shield, EyeOff, Radio } from 'lucide-react';
import { Card, Heading, Text, Badge, BadgeText } from './ui';
import { useLanguage } from '../i18n/LanguageContext';

export const FeaturesSection: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  return (
    <section id="fitur" className="py-20 md:py-28 bg-[#F8FAFC] border-b border-outline-100 relative overflow-hidden">
      {/* Decorative background grid and blurs */}
      <div className="absolute inset-0 hero-dot-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 right-5 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-5 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge action="secondary" size="lg" className="mb-3.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <BadgeText>{isEn ? '4 Core Product Pillars' : '4 Pilar Utama Produk'}</BadgeText>
          </Badge>
          <Heading as="h2" size="2xl" className="font-extrabold text-typography-900 tracking-tight">
            {isEn ? 'Built Purely for Personal Satisfaction' : 'Dibuat Khusus untuk Kepuasan Diri'}
          </Heading>
          <Text size="sm" className="mt-3.5 text-typography-600 leading-relaxed max-w-xl mx-auto">
            {isEn
              ? 'Not a public toilet finder or social network. This is the fastest, most private personal biological journal designed for speed and peace of mind.'
              : 'Ini bukan pencari toilet umum dan bukan media sosial. Ini adalah catatan biologis personal tercepat, teraman, dan paling memuaskan untuk kesehatanmu.'}
          </Text>
        </div>

        {/* Modern Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Pillar 1: Hero Pillar (7 Cols) */}
          <Card
            variant="elevated"
            size="lg"
            className="lg:col-span-7 relative overflow-hidden group hover:border-primary-400 hover:shadow-xl transition-all duration-300 rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-white border border-outline-100"
          >
            {/* Watermark Pillar Number */}
            <span className="absolute top-4 right-6 text-6xl font-black text-slate-100 select-none pointer-events-none group-hover:text-primary-50 transition-colors">
              01
            </span>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-xs">
                  <Zap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
                  {isEn ? 'Fastest Flow' : 'Paling Sat-set'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-typography-900 mb-2.5">
                {isEn ? '3-Second / 2-Tap Quick Log' : 'Catat 3-Detik / 2-Tap Sat-set'}
              </h3>
              <p className="text-typography-600 text-sm leading-relaxed mb-6 max-w-xl">
                {isEn
                  ? "Zero unnecessary forms while in the restroom. Hit + LOG, pick your mascot, and your record locks into device storage in under 100 milliseconds."
                  : "Tanpa formulir panjang berbelit. Cukup sentuh tombol + LOG, pilih maskot (Lil' Drip, Mr. Plop, atau Sir Flush), dan catatan tersimpan di HP di bawah 100ms."}
              </p>

              {/* Visual Micro-Step Process */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                <div className="text-center p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs">
                  <span className="block text-[10px] font-extrabold text-primary-600">STEP 1</span>
                  <span className="block text-xs font-bold text-typography-900 mt-0.5">Sentuh + LOG</span>
                </div>
                <div className="text-center p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs">
                  <span className="block text-[10px] font-extrabold text-primary-600">STEP 2</span>
                  <span className="block text-xs font-bold text-typography-900 mt-0.5">Pilih Maskot</span>
                </div>
                <div className="text-center p-2 rounded-xl bg-primary-50 border border-primary-200/60 shadow-xs">
                  <span className="block text-[10px] font-extrabold text-secondary-600">READY</span>
                  <span className="block text-xs font-bold text-primary-700 mt-0.5">&lt; 100ms Selesai!</span>
                </div>
              </div>
            </div>

            {/* Bottom Async Geotagging Pill */}
            <div className="bg-slate-50/80 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-typography-900 block">
                    {isEn ? 'Async Auto-Geotagging' : 'Auto-Geotagging Asinkron'}
                  </span>
                  <span className="text-typography-500 text-[11px]">
                    {isEn ? 'GPS, altitude (masl), & district captured in background' : 'GPS, ketinggian mdpl & nama kecamatan otomatis di latar'}
                  </span>
                </div>
              </div>
              <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Otomatis
              </span>
            </div>
          </Card>

          {/* Pillar 2: Personal Map & Clustering (5 Cols) */}
          <Card
            variant="elevated"
            size="lg"
            className="lg:col-span-5 relative overflow-hidden group hover:border-secondary-400 hover:shadow-xl transition-all duration-300 rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-white border border-outline-100"
          >
            <span className="absolute top-4 right-6 text-6xl font-black text-slate-100 select-none pointer-events-none group-hover:text-secondary-50 transition-colors">
              02
            </span>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-600 shadow-xs">
                  <MapPin className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200/60 px-3 py-1 rounded-full">
                  {isEn ? 'Offline Footprint' : 'Jejak Pribadi'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-typography-900 mb-2.5">
                {isEn ? 'Personal Map & Clustering' : 'Peta Pribadi & Clustering'}
              </h3>
              <p className="text-typography-600 text-sm leading-relaxed mb-6">
                {isEn
                  ? 'Like Strava or Swarm, but strictly for your own body. Offline map clusters every restroom you have visited across provinces.'
                  : 'Sensasi peta penjelajahan layaknya Strava, khusus untuk jejak biologismu. Pin dan clustering otomatis di berbagai kota secara offline.'}
              </p>
            </div>

            {/* Privacy Blur Highlight */}
            <div className="bg-teal-50/60 border border-teal-100 p-4 rounded-2xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <EyeOff className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-typography-900 block">
                  {isEn ? '50-Meter Privacy Blur' : 'Pengaburan Presisi 50m'}
                </span>
                <span className="text-typography-500 text-[11px] block mt-0.5">
                  {isEn ? 'Masks exact home and workplace coordinates' : 'Opsi mengaburkan koordinat pasti rumah & kantor'}
                </span>
              </div>
            </div>
          </Card>

          {/* Pillar 3: Gamifikasi & Streak Sehat (5 Cols) */}
          <Card
            variant="elevated"
            size="lg"
            className="lg:col-span-5 relative overflow-hidden group hover:border-amber-400 hover:shadow-xl transition-all duration-300 rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-white border border-outline-100"
          >
            <span className="absolute top-4 right-6 text-6xl font-black text-slate-100 select-none pointer-events-none group-hover:text-amber-50 transition-colors">
              03
            </span>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shadow-xs">
                  <Flame className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200/60 px-3 py-1 rounded-full">
                  {isEn ? 'Habit Booster' : 'Motivasi Sehat'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-typography-900 mb-2.5">
                {isEn ? 'Streaks & Healthy Ratios' : 'Streak & Rasio Hidrasi Sehat'}
              </h3>
              <p className="text-typography-600 text-sm leading-relaxed mb-6">
                {isEn
                  ? 'Build healthy hydration and bowel consistency through intuitive weekly balance ratios without stressful medical judgment.'
                  : 'Pertahankan rutinitas hidrasi dan konsistensi pencernaan dengan rasio visual mingguan serta lencana koleksi yang menyenangkan.'}
              </p>
            </div>

            {/* Visual Ratio Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-xs font-extrabold text-typography-800 mb-2">
                <span>Rasio Mingguan (BAK : BAB)</span>
                <span className="text-primary-600">65% : 35% Ideal</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 flex overflow-hidden">
                <div className="bg-sky-500 h-full w-[65%]" title="Pee" />
                <div className="bg-amber-600 h-full w-[35%]" title="Poop" />
              </div>
            </div>
          </Card>

          {/* Pillar 4: Kedaulatan Data & Zero-Social (7 Cols) */}
          <Card
            variant="elevated"
            size="lg"
            className="lg:col-span-7 relative overflow-hidden group hover:border-primary-400 hover:shadow-xl transition-all duration-300 rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-white border border-outline-100"
          >
            <span className="absolute top-4 right-6 text-6xl font-black text-slate-100 select-none pointer-events-none group-hover:text-primary-50 transition-colors">
              04
            </span>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-primary-600 shadow-xs">
                  <Shield className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-primary-700 bg-primary-50 border border-primary-200/60 px-3 py-1 rounded-full">
                  {isEn ? 'Data Sovereignty' : 'Kedaulatan Data'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-typography-900 mb-2.5">
                {isEn ? '100% Zero-Social & Fully Offline' : '100% Zero-Social & Bebas Pelacak'}
              </h3>
              <p className="text-typography-600 text-sm leading-relaxed mb-6 max-w-xl">
                {isEn
                  ? 'Your biological rhythms are strictly personal. No social feeds, no public profiles, no creepy third-party data broker SDKs. Everything is encrypted on your phone.'
                  : 'Aktivitas toilet adalah data biologis paling privat. Tidak ada feed publik, tidak ada follower, dan tidak ada pelacak iklan pihak ketiga. Data aman di perangkatmu.'}
              </p>
            </div>

            {/* Checklist Feature Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-typography-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Kunci Biometrik</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-typography-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>SQLite Lokal</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-typography-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Ekspor JSON Bebas</span>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </section>
  );
};
