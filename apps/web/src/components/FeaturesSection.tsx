import React from 'react';
import { Zap, MapPin, Flame, Lock, Sparkles } from 'lucide-react';
import { MrPlopSVG, LilDripSVG, SirFlushSVG } from './MascotSVGs';
import { Card, Heading, Text, Badge, BadgeText } from './ui';
import { useLanguage } from '../i18n/LanguageContext';

export const FeaturesSection: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  return (
    <section id="fitur" className="py-16 md:py-24 border-b border-[#F1F5F9] bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge action="secondary" size="lg" className="mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <BadgeText>{isEn ? '4 Core Product Pillars' : '4 Pilar Utama Produk'}</BadgeText>
          </Badge>
          <Heading as="h2" size="2xl">
            {isEn ? 'Built Purely for Personal Satisfaction' : 'Dibuat Khusus untuk Kepuasan Diri'}
          </Heading>
          <Text size="sm" className="mt-3 leading-relaxed">
            {isEn
              ? 'Not a public toilet finder or restroom review app. This is the fastest, most private personal biological journal in the world.'
              : 'Ini bukan aplikasi pencari toilet atau review kloset umum. Ini adalah catatan sejarah biologis personal paling sat-set dan privat di dunia.'}
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Pillar 1 */}
          <Card variant="elevated" size="lg" className="relative overflow-hidden group hover:border-primary-500">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF7E0] border border-[#F5B700]/30 flex items-center justify-center p-2.5">
                <Zap className="w-6 h-6 text-[#D97706]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706] bg-[#FEF7E0] border border-[#F5B700]/30 px-3 py-1 rounded-full">
                {isEn ? 'Pillar #1' : 'Prinsip #1'}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-[#0C102A] mb-2">
              {isEn ? '3-Second / 2-Tap Quick Log' : '3-Detik / 2-Tap Sat-set'}
            </h3>
            <p className="text-[#475569] text-xs sm:text-sm leading-relaxed mb-5">
              {isEn ? (
                <>
                  No lengthy forms while you're in the restroom. Tap <strong>+ LOG</strong>, choose <strong>Lil' Drip</strong> (Pee), <strong>Mr. Plop</strong> (Poop), or <strong>Sir Flush</strong> (Combo), and it saves locally in under 100ms.
                </>
              ) : (
                <>
                  Tanpa form panjang yang bikin pegal di toilet. Sentuh tombol <strong>+ LOG</strong>, pilih <strong>Lil' Drip</strong> (Pee), <strong>Mr. Plop</strong> (Poop), atau <strong>Sir Flush</strong> (Combo), dan data langsung tersimpan ke memori HP dalam waktu kurang dari 100 milidetik.
                </>
              )}
            </p>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4F0FF] p-1.5 flex-shrink-0 shadow-xs flex items-center justify-center border border-white">
                <LilDripSVG />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#0C102A] block">
                  {isEn ? 'Async Auto-Geotagging' : 'Auto-Geotagging Asinkron'}
                </span>
                <span className="text-[#64748B] text-[11px]">
                  {isEn
                    ? 'GPS, altitude (masl), & district name filled automatically in background.'
                    : 'GPS, elevasi mdpl & nama kecamatan terisi otomatis di background.'}
                </span>
              </div>
            </div>
          </Card>

          {/* Pillar 2 */}
          <Card variant="elevated" size="lg" className="relative overflow-hidden group hover:border-secondary-500">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#E7F7F6] border border-[#00BA9D]/30 flex items-center justify-center p-2.5">
                <MapPin className="w-6 h-6 text-[#00BA9D]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#00BA9D] bg-[#E7F7F6] border border-[#00BA9D]/30 px-3 py-1 rounded-full">
                {isEn ? 'Pillar #2' : 'Prinsip #2'}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-[#0C102A] mb-2">
              {isEn ? 'Personal Map & Clustering' : 'Peta Pribadi & Clustering'}
            </h3>
            <p className="text-[#475569] text-xs sm:text-sm leading-relaxed mb-5">
              {isEn ? (
                <>
                  Like <strong>Strava</strong> or <strong>Swarm</strong>, but strictly for your own biological footprint. Interactive offline map pins every toilet you've visited across cities.
                </>
              ) : (
                <>
                  Seperti <strong>Strava</strong> atau <strong>Swarm</strong>, tapi khusus untuk jejak biologis diri sendiri. Peta interaktif offline menandai setiap toilet yang pernah kamu singgahi di berbagai kota.
                </>
              )}
            </p>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C6F6E2] p-1.5 flex-shrink-0 shadow-xs flex items-center justify-center border border-white">
                <SirFlushSVG />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#0C102A] block">
                  {isEn ? '50m Privacy Blur Option' : 'Opsi Pengaburan 50m'}
                </span>
                <span className="text-[#64748B] text-[11px]">
                  {isEn
                    ? 'Protects home and office precise coordinates on the map.'
                    : 'Melindungi koordinat presisi rumah dan kantor di peta.'}
                </span>
              </div>
            </div>
          </Card>

          {/* Pillar 3 */}
          <Card variant="elevated" size="lg" className="relative overflow-hidden group hover:border-poop-brown">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#F7EFE9] border border-[#8B5E3C]/30 flex items-center justify-center p-2.5">
                <Flame className="w-6 h-6 text-[#8B5E3C]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8B5E3C] bg-[#F7EFE9] border border-[#8B5E3C]/30 px-3 py-1 rounded-full">
                {isEn ? 'Pillar #3' : 'Prinsip #3'}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-[#0C102A] mb-2">
              {isEn ? 'Streaks & Gamification' : 'Streak & Gamifikasi Sehat'}
            </h3>
            <p className="text-[#475569] text-xs sm:text-sm leading-relaxed mb-5">
              {isEn ? (
                <>
                  Build healthy hydration and bowel habits with intuitive weekly ratios (Pee vs Poop) and humorous achievement badges without medical judgment.
                </>
              ) : (
                <>
                  Bangun kebiasaan hidrasi sehat dan ritme buang air teratur dengan rasio visual mingguan serta lencana pencapaian unik tanpa penghakiman medis kaku.
                </>
              )}
            </p>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FDE6C9] p-1.5 flex-shrink-0 shadow-xs flex items-center justify-center border border-white">
                <MrPlopSVG />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#0C102A] block">
                  {isEn ? 'Humorous Badges' : 'Lencana Koleksi Eksentrik'}
                </span>
                <span className="text-[#64748B] text-[11px]">
                  {isEn
                    ? 'Collect rare achievements from City Explorer to Peak Relief.'
                    : 'Koleksi pencapaian langka dari Kolektor Kecamatan hingga Pelega Puncak.'}
                </span>
              </div>
            </div>
          </Card>

          {/* Pillar 4 */}
          <Card variant="elevated" size="lg" className="relative overflow-hidden group hover:border-primary-500">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF5FC] border border-[#2447F9]/30 flex items-center justify-center p-2.5">
                <Lock className="w-6 h-6 text-[#2447F9]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2447F9] bg-[#EBF5FC] border border-[#2447F9]/30 px-3 py-1 rounded-full">
                {isEn ? 'Pillar #4' : 'Prinsip #4'}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-[#0C102A] mb-2">
              {isEn ? '100% Zero-Social & Offline' : '100% Zero-Social & Offline'}
            </h3>
            <p className="text-[#475569] text-xs sm:text-sm leading-relaxed mb-5">
              {isEn ? (
                <>
                  Restroom biology is ultra-sensitive personal data. In Phase 1: <strong>NO social feeds</strong>, <strong>NO friend lists</strong>, and <strong>NO third-party ad trackers</strong>.
                </>
              ) : (
                <>
                  Aktivitas biologis buang air adalah data personal yang paling privat. Di Fase 1: <strong>TIDAK ADA feed sosial</strong>, <strong>TIDAK ADA follower</strong>, dan <strong>TIDAK ADA pelacak iklan pihak ketiga</strong>.
                </>
              )}
            </p>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C6F6E2] p-1.5 flex-shrink-0 shadow-xs flex items-center justify-center border border-white">
                <SirFlushSVG />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#0C102A] block">
                  {isEn ? 'Local SQLite & Row Security' : 'SQLite Lokal & Keamanan Data'}
                </span>
                <span className="text-[#64748B] text-[11px]">
                  {isEn
                    ? 'Works without signal in basements, planes, and mountains.'
                    : 'Bisa dipakai tanpa sinyal di basement, pesawat, atau gunung.'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
