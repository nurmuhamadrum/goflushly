import React, { useState } from 'react';
import { MrPlopSVG, LilDripSVG, SirFlushSVG } from './MascotSVGs';
import {
  MapPin,
  Calendar,
  BarChart3,
  User,
  ChevronRight,
  X,
  Compass,
  Navigation,
  Plus,
  Minus,
  Check,
} from 'lucide-react';

export type MockupScreen = 'map' | 'quick-log' | 'mood' | 'timeline' | 'stats' | 'profile' | 'auth';

interface PhoneMockupProps {
  currentScreen?: MockupScreen;
  onScreenChange?: (screen: MockupScreen) => void;
  className?: string;
  compact?: boolean;
}

interface MapPinItem {
  id: string;
  type: 'pee' | 'poop' | 'combo';
  title: string;
  location: string;
  time: string;
  mood: string;
  note: string;
  x: number;
  y: number;
  badge: string;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  currentScreen,
  onScreenChange,
  className = '',
  compact = false,
}) => {
  const [internalScreen, setInternalScreen] = useState<MockupScreen>('map');
  const [mapFilter, setMapFilter] = useState<'all' | 'pee' | 'poop' | 'combo'>('all');
  const [selectedPinId, setSelectedPinId] = useState<string | null>('pee-menteng');
  const [selectedQuickType, setSelectedQuickType] = useState<'poop' | 'pee' | 'combo'>('poop');
  const [selectedMood, setSelectedMood] = useState<string>('Lega Banget');

  const activeScreen = currentScreen !== undefined ? currentScreen : internalScreen;

  const setScreen = (s: MockupScreen) => {
    if (onScreenChange) {
      onScreenChange(s);
    } else {
      setInternalScreen(s);
    }
  };

  const mapPins: MapPinItem[] = [
    {
      id: 'pee-menteng',
      type: 'pee',
      title: "Lil' Drip • Lega Banget",
      location: 'Kec. Menteng, Jakarta Pusat',
      time: '14:15',
      mood: 'Lega Banget 😌',
      note: '"Setelah meeting 3 jam akhirnya plong!"',
      x: 68,
      y: 26,
      badge: 'Menteng',
    },
    {
      id: 'poop-gi',
      type: 'poop',
      title: 'Mr. Plop • Plong Sekali',
      location: 'Grand Indonesia Lt. 3A',
      time: '08:30',
      mood: 'Plong Sekali ✨',
      note: '"Kloset otomatisnya nyaman banget"',
      x: 26,
      y: 42,
      badge: 'Grand Indonesia',
    },
    {
      id: 'combo-sudirman',
      type: 'combo',
      title: 'Sir Flush • Selesai Tuntas',
      location: 'SCBD Sudirman Kav. 52',
      time: '12:00',
      mood: 'Kombo Sukses 🚽',
      note: '"Paket kombo sebelum jam makan siang"',
      x: 54,
      y: 54,
      badge: 'SCBD',
    },
    {
      id: 'pee-senayan',
      type: 'pee',
      title: "Lil' Drip • Nahan Lama",
      location: 'Gelora Bung Karno, Senayan',
      time: '17:40',
      mood: 'Nahan Lama 🏃',
      note: '"Jogging sore lalu kebelet"',
      x: 28,
      y: 72,
      badge: 'GBK Senayan',
    },
  ];

  const filteredPins = mapPins.filter((pin) => {
    if (mapFilter === 'all') return true;
    return pin.type === mapFilter;
  });

  const selectedPin = mapPins.find((p) => p.id === selectedPinId);

  const sizeClasses = compact
    ? 'w-[310px] sm:w-[350px] md:w-[365px] h-[680px] sm:h-[710px] rounded-[46px]'
    : 'w-[320px] sm:w-[360px] md:w-[380px] h-[720px] rounded-[48px]';

  const getPastelBg = (type: 'pee' | 'poop' | 'combo') =>
    type === 'poop' ? 'bg-[#FDE6C9]' : type === 'pee' ? 'bg-[#D4F0FF]' : 'bg-[#C6F6E2]';

  return (
    <div
      className={`${sizeClasses} bg-background-50 border-[8px] border-[#0C102A] shadow-2xl relative overflow-hidden flex flex-col transition-all duration-300 ${className}`}
    >
      {/* 1. TOP DYNAMIC ISLAND & STATUS BAR */}
      <div className="h-10 pt-2.5 px-7 flex items-center justify-between text-xs text-typography-900 select-none z-40 bg-white border-b border-outline-100">
        <span className="font-bold text-xs tracking-tight">9:41</span>
        <div className="w-24 h-5 bg-[#0C102A] rounded-full flex items-center justify-end px-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-typography-600 font-bold">5G</span>
          <div className="w-5 h-2.5 border border-typography-900 rounded-sm p-0.5 flex items-center">
            <div className="h-full w-full bg-secondary-500 rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* 2. MAIN SCREEN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* ============================== */}
        {/* A. PERSONAL MAP SCREEN         */}
        {/* ============================== */}
        {activeScreen === 'map' && (
          <div className="flex-1 flex flex-col relative overflow-hidden bg-[#F5F4EE]">
            {/* Bright Pastel SVG City Map */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 380 620"
              preserveAspectRatio="none"
            >
              <rect width="380" height="620" fill="#F5F4EE" />

              {/* Soft Parks */}
              <g fill="#C9F2D4" stroke="#A7E8BA" strokeWidth="1">
                <path d="M 240,85 Q 290,75 335,115 Q 320,175 255,175 Z" />
                <path d="M 20,490 Q 65,475 110,505 Q 88,565 30,550 Z" />
                <path d="M 255,320 Q 320,305 365,345 Q 355,405 275,395 Z" />
              </g>

              {/* Pastel River */}
              <path
                d="M -10,145 Q 70,185 140,165 T 265,255 T 395,295"
                fill="none"
                stroke="#9EDAFB"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Crisp White Street Grid */}
              <g fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 0,185 L 380,185" />
                <path d="M 0,315 L 380,315" />
                <path d="M 0,465 L 380,465" />
                <path d="M 125,0 L 125,620" />
                <path d="M 240,0 L 240,620" />
                <path d="M 0,270 L 380,370" />
              </g>

              {/* Arterial Road */}
              <path
                d="M 175,0 L 195,200 L 210,400 L 180,620"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M -10,430 L 390,390"
                fill="none"
                stroke="#FDE8B6"
                strokeWidth="7"
                strokeLinecap="round"
              />

              {/* Area Labels */}
              <g fontSize="8" fontWeight="800" fill="#64748B" letterSpacing="1">
                <text x="268" y="145">MENTENG</text>
                <text x="272" y="365">KUNINGAN</text>
                <text x="44" y="475">SENAYAN</text>
              </g>

              {/* User Live GPS Pulse */}
              <g>
                <circle cx="165" cy="360" r="28" fill="#2447F9" fillOpacity="0.1" stroke="#2447F9" strokeWidth="1.2" strokeDasharray="3 3" />
                <circle cx="165" cy="360" r="14" fill="#2447F9" fillOpacity="0.22" className="animate-ping" />
                <circle cx="165" cy="360" r="6" fill="#2447F9" stroke="#FFFFFF" strokeWidth="2.5" />
              </g>
            </svg>

            {/* Top Floating Area Info & Filter Pills */}
            <div className="absolute top-3 inset-x-3 z-20 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="bg-white/95 backdrop-blur border border-outline-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-typography-900">Jakarta Pusat</span>
                </div>

                <div className="flex bg-white/95 backdrop-blur border border-outline-200 p-0.5 rounded-full text-[10px] font-bold shadow-sm">
                  {(['all', 'poop', 'pee', 'combo'] as const).map((f) => {
                    const isActive = mapFilter === f;
                    const label = f === 'all' ? 'Semua' : f === 'poop' ? 'BAB' : f === 'pee' ? 'BAK' : 'Kombo';
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setMapFilter(f)}
                        className={`px-2.5 py-1 rounded-full transition-all ${
                          isActive
                            ? 'bg-primary-500 text-white shadow-xs'
                            : 'text-typography-600 hover:text-typography-900'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Side Map Controls */}
            <div className="absolute top-16 right-3 z-20 flex flex-col items-center gap-2">
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-white border border-outline-200 flex items-center justify-center text-emergency shadow-sm hover:bg-background-50"
                title="Kompas"
              >
                <Compass className="w-4 h-4" />
              </button>
              <div className="bg-white border border-outline-200 rounded-xl flex flex-col items-center shadow-sm overflow-hidden">
                <button type="button" className="w-7 h-7 flex items-center justify-center text-typography-600 hover:text-primary-500 hover:bg-background-50 border-b border-outline-100">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="w-7 h-7 flex items-center justify-center text-typography-600 hover:text-primary-500 hover:bg-background-50">
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-white border border-outline-200 flex items-center justify-center text-primary-500 shadow-sm hover:scale-105 transition-transform"
                title="Lokasi Saya"
              >
                <Navigation className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            {/* Pastel Circular 3D Mascot Pins */}
            <div className="relative w-full h-full">
              {filteredPins.map((pin) => {
                const isSelected = selectedPinId === pin.id;
                const dotColor = pin.type === 'poop' ? 'bg-[#FBBF24]' : pin.type === 'pee' ? 'bg-primary-500' : 'bg-secondary-500';
                return (
                  <button
                    type="button"
                    key={pin.id}
                    onClick={() => setSelectedPinId(pin.id)}
                    style={{ top: `${pin.y}%`, left: `${pin.x}%` }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all flex flex-col items-center z-10 ${
                      isSelected ? 'scale-110 z-20' : 'hover:scale-105'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${getPastelBg(pin.type)} border-2 ${
                        isSelected ? 'border-primary-500 ring-2 ring-primary-500/25 shadow-lg' : 'border-white shadow-md'
                      } p-1 flex items-center justify-center`}
                    >
                      {pin.type === 'pee' && <LilDripSVG className="w-7 h-7" />}
                      {pin.type === 'poop' && <MrPlopSVG className="w-7 h-7" />}
                      {pin.type === 'combo' && <SirFlushSVG className="w-7 h-7" />}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${dotColor} border border-white mt-0.5 shadow-xs`} />
                    {isSelected && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white text-typography-900 border border-outline-200 shadow-sm mt-0.5 whitespace-nowrap">
                        {pin.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Selected Pin Summary Card */}
              {selectedPin && (
                <div className="absolute bottom-4 inset-x-3 bg-white border border-outline-200 rounded-2xl p-3.5 shadow-xl z-30 animate-fadeIn">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${getPastelBg(selectedPin.type)} p-1.5 flex items-center justify-center flex-shrink-0`}>
                        {selectedPin.type === 'pee' && <LilDripSVG className="w-8 h-8" />}
                        {selectedPin.type === 'poop' && <MrPlopSVG className="w-8 h-8" />}
                        {selectedPin.type === 'combo' && <SirFlushSVG className="w-8 h-8" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-typography-900 truncate">
                            {selectedPin.title}
                          </span>
                          <span className="text-[10px] text-typography-400">{selectedPin.time}</span>
                        </div>
                        <p className="text-[11px] text-typography-600 mt-0.5 font-medium truncate">
                          {selectedPin.location}
                        </p>
                        <p className="text-[11px] text-primary-500 italic mt-0.5 font-medium truncate">
                          {selectedPin.note}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPinId(null)}
                      className="text-typography-400 hover:text-typography-900 p-1 rounded-lg hover:bg-background-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-outline-100 flex items-center justify-between text-[10px]">
                    <span className="text-secondary-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" /> 100% Privat &amp; Lokal
                    </span>
                    <button
                      type="button"
                      onClick={() => setScreen('timeline')}
                      className="text-primary-500 font-bold hover:underline"
                    >
                      Buka di Diary →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* B. QUICK LOG SHEET (EXACT MOBILE MOCKUP) */}
        {/* ============================== */}
        {activeScreen === 'quick-log' && (
          <div className="flex-1 flex flex-col justify-end px-3 pb-3 pt-6 bg-[#0C102A]/40 backdrop-blur-[2px] overflow-y-auto">
            <div className="bg-white border border-outline-200 rounded-[28px] p-5 shadow-2xl animate-fadeIn">
              <div className="w-10 h-1 bg-outline-300 rounded-full mx-auto mb-3" />
              <h3 className="text-lg font-black text-typography-900 text-center mb-4">Catat Sekarang</h3>

              {/* 3 Side-by-Side 3D Mascot Cards */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {[
                  { id: 'poop' as const, name: 'Mr. Plop', sub: 'BAB', bg: 'bg-[#FDE6C9]' },
                  { id: 'pee' as const, name: "Lil' Drip", sub: 'BAK', bg: 'bg-[#D4F0FF]' },
                  { id: 'combo' as const, name: 'Sir Flush', sub: 'Keduanya', bg: 'bg-[#C6F6E2]' },
                ].map((item) => {
                  const active = selectedQuickType === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedQuickType(item.id)}
                      className={`relative p-2.5 rounded-2xl border transition-all flex flex-col items-center text-center ${
                        active
                          ? 'border-2 border-primary-500 bg-primary-0/50 shadow-sm'
                          : 'border-outline-200 bg-white hover:border-outline-300'
                      }`}
                    >
                      {active && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                      <div className={`w-12 h-12 rounded-xl ${item.bg} p-1.5 flex items-center justify-center mb-1.5`}>
                        {item.id === 'poop' && <MrPlopSVG className="w-9 h-9" />}
                        {item.id === 'pee' && <LilDripSVG className="w-9 h-9" />}
                        {item.id === 'combo' && <SirFlushSVG className="w-9 h-9" />}
                      </div>
                      <span className="font-extrabold text-[11px] text-typography-900 leading-tight">{item.name}</span>
                      <span className={`text-[10px] font-bold mt-0.5 ${active ? 'text-primary-500' : 'text-typography-500'}`}>
                        {item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Mood Row */}
              <label className="text-[11px] font-bold text-typography-900 block mb-1.5">Mood</label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {['😌 Lega Banget', '⏱️ Nahan Lama', '🚨 Darurat'].map((m) => {
                  const active = selectedMood === m;
                  return (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setSelectedMood(m)}
                      className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                        active
                          ? 'bg-primary-0 border-primary-500 text-primary-500'
                          : 'bg-background-50 border-outline-200 text-typography-600 hover:text-typography-900'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>

              {/* Note Input */}
              <label className="text-[11px] font-bold text-typography-900 block mb-1">Catatan</label>
              <input
                type="text"
                readOnly
                value="Plong setelah kopi susu pagi!"
                className="w-full bg-background-50 border border-outline-200 rounded-xl px-3 py-2 text-xs text-typography-900 mb-4 outline-none"
              />

              <button
                type="button"
                onClick={() => setScreen('timeline')}
                className="w-full py-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-md shadow-primary-500/25 active:scale-95 transition-all"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* C. MOOD SHEET                  */}
        {/* ============================== */}
        {activeScreen === 'mood' && (
          <div className="flex-1 flex flex-col justify-end p-4 bg-[#0C102A]/40 backdrop-blur-[2px]">
            <div className="bg-white border border-outline-200 rounded-[28px] p-5 shadow-2xl animate-fadeIn">
              <div className="w-10 h-1 bg-outline-300 rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#C6F6E2] p-1.5 flex items-center justify-center">
                    <SirFlushSVG className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-secondary-500 tracking-wider">
                      Lega Tercatat!
                    </span>
                    <h4 className="text-sm font-extrabold text-typography-900">Bagaimana Mood-mu?</h4>
                  </div>
                </div>
                <button type="button" onClick={() => setScreen('map')} className="text-xs text-primary-500 font-bold hover:underline">
                  Lewati
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button type="button" className="px-3 py-2.5 rounded-xl bg-primary-0 border border-primary-500 text-primary-500 text-xs font-bold text-left flex items-center gap-2">
                  <span>😌</span> Lega Banget
                </button>
                <button type="button" className="px-3 py-2.5 rounded-xl bg-background-50 border border-outline-200 text-typography-600 hover:text-typography-900 text-xs font-semibold text-left flex items-center gap-2">
                  <span>⏱️</span> Nahan Lama
                </button>
                <button type="button" className="px-3 py-2.5 rounded-xl bg-emergency/10 border border-emergency/40 text-emergency text-xs font-bold text-left flex items-center gap-2">
                  <span>🚨</span> Momen Darurat
                </button>
                <button type="button" className="px-3 py-2.5 rounded-xl bg-background-50 border border-outline-200 text-typography-600 hover:text-typography-900 text-xs font-semibold text-left flex items-center gap-2">
                  <span>✨</span> Super Lancar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setScreen('timeline')}
                className="w-full py-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-md shadow-primary-500/25 active:scale-95 transition-all"
              >
                Simpan &amp; Buka Buku Harian
              </button>
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* D. TIMELINE SCREEN             */}
        {/* ============================== */}
        {activeScreen === 'timeline' && (
          <div className="flex-1 flex flex-col bg-background-50 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-black text-typography-900">Buku Harian Lega</h3>
              <p className="text-xs text-typography-500">Total 12 jejak lega tercatat</p>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-bold text-secondary-500 uppercase tracking-wider">
                Hari Ini • 21 Nov 2026
              </div>

              <div className="bg-white border border-outline-200 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-[#D4F0FF] p-1.5 flex items-center justify-center flex-shrink-0">
                  <LilDripSVG className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-typography-900">Lil&apos; Drip • Lega Banget</span>
                    <span className="text-[10px] text-typography-400">14:15</span>
                  </div>
                  <p className="text-[11px] text-typography-600">Kec. Menteng, Jakarta Pusat</p>
                  <p className="text-[11px] text-primary-500 italic mt-0.5 truncate">
                    "Setelah meeting 3 jam akhirnya plong!"
                  </p>
                </div>
              </div>

              <div className="bg-white border border-outline-200 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-[#FDE6C9] p-1.5 flex items-center justify-center flex-shrink-0">
                  <MrPlopSVG className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-typography-900">Mr. Plop • Plong Sekali</span>
                    <span className="text-[10px] text-typography-400">08:30</span>
                  </div>
                  <p className="text-[11px] text-typography-600">Grand Indonesia, Lt. 3A</p>
                  <p className="text-[11px] text-typography-500 italic mt-0.5 truncate">
                    "Kloset otomatisnya nyaman banget"
                  </p>
                </div>
              </div>

              <div className="bg-white border border-outline-200 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-[#C6F6E2] p-1.5 flex items-center justify-center flex-shrink-0">
                  <SirFlushSVG className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-typography-900">Sir Flush • Kombo</span>
                    <span className="text-[10px] text-typography-400">Kemarin</span>
                  </div>
                  <p className="text-[11px] text-typography-600">SCBD Sudirman Kav. 52</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* E. STATS SCREEN (EXACT MOBILE MOCKUP) */}
        {/* ============================== */}
        {activeScreen === 'stats' && (
          <div className="flex-1 flex flex-col bg-background-50 p-4 overflow-y-auto">
            <div className="mb-3">
              <h3 className="text-lg font-black text-typography-900">Statistik &amp; Lencana</h3>
              <p className="text-xs text-typography-500">Pencapaian bersama Trio Maskot</p>
            </div>

            {/* Signature Deep Navy Streak Hero Card */}
            <div className="bg-background-900 text-white rounded-2xl p-4 mb-3.5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider">
                  Streak Aktif
                </span>
                <div className="text-2xl font-black text-white leading-tight mt-0.5">
                  5 Hari 🔥
                </div>
                <p className="text-[11px] text-typography-400 mt-0.5">2 hari lagi menuju &quot;Lancar Jaya&quot;!</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-secondary-500/15 border-4 border-secondary-500 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                71%
              </div>
            </div>

            {/* 2 Crisp White KPI Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white border border-outline-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FDE6C9] p-1 flex items-center justify-center">
                    <MrPlopSVG className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-typography-900 leading-none">14x</div>
                    <span className="text-[10px] text-typography-500 font-bold">BAB</span>
                  </div>
                </div>
                <span className="block text-center text-[10px] font-bold text-typography-600 bg-background-100 rounded-full py-1">
                  Bulan ini
                </span>
              </div>

              <div className="bg-white border border-outline-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#D4F0FF] p-1 flex items-center justify-center">
                    <LilDripSVG className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-typography-900 leading-none">32x</div>
                    <span className="text-[10px] text-typography-500 font-bold">BAK</span>
                  </div>
                </div>
                <span className="block text-center text-[10px] font-bold text-typography-600 bg-background-100 rounded-full py-1">
                  Bulan ini
                </span>
              </div>
            </div>

            {/* Badges Preview */}
            <div className="text-xs font-extrabold text-typography-900 mb-2">Achievement Badges</div>
            <div className="grid grid-cols-2 gap-2.5 pb-4">
              <div className="bg-white border border-outline-200 rounded-2xl p-3 text-center shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-[#D4F0FF] p-1.5 mx-auto mb-1.5 flex items-center justify-center">
                  <LilDripSVG className="w-8 h-8" />
                </div>
                <div className="font-bold text-xs text-typography-900">Pendatang Baru</div>
                <span className="inline-block mt-1 text-[9px] bg-secondary-0 text-secondary-500 px-2 py-0.5 rounded-full font-bold">
                  DIRAIH
                </span>
              </div>
              <div className="bg-white border border-outline-200 rounded-2xl p-3 text-center shadow-xs">
                <div className="w-11 h-11 rounded-xl bg-[#FDE6C9] p-1.5 mx-auto mb-1.5 flex items-center justify-center">
                  <MrPlopSVG className="w-8 h-8" />
                </div>
                <div className="font-bold text-xs text-typography-900">Penjelajah Kota</div>
                <span className="inline-block mt-1 text-[9px] bg-secondary-0 text-secondary-500 px-2 py-0.5 rounded-full font-bold">
                  DIRAIH
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* F. PROFILE & SECURITY SCREEN   */}
        {/* ============================== */}
        {activeScreen === 'profile' && (
          <div className="flex-1 flex flex-col p-4 bg-background-50 overflow-y-auto">
            <div className="pt-1 mb-3">
              <h3 className="text-base font-black text-typography-900">Profil &amp; Keamanan</h3>
              <p className="text-[11px] text-typography-500">Identitas privat &amp; cadangan lokal</p>
            </div>

            <div className="bg-white border border-outline-200 rounded-2xl p-4 mb-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#C6F6E2] p-1.5 flex items-center justify-center">
                  <SirFlushSVG className="w-9 h-9" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-typography-900">Penjelajah Lokal</span>
                    <span className="text-[9px] font-bold text-secondary-500 bg-secondary-0 px-2 py-0.5 rounded-full">
                      100% PRIVAT
                    </span>
                  </div>
                  <span className="text-[10px] text-typography-500 block mt-0.5">user@pooppeelog.app</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 bg-background-50 rounded-xl p-2 mt-3 text-center border border-outline-100">
                <div>
                  <span className="text-xs font-black text-typography-900 block">46</span>
                  <span className="text-[8px] text-typography-500 uppercase font-bold">Total</span>
                </div>
                <div>
                  <span className="text-xs font-black text-primary-500 block">32</span>
                  <span className="text-[8px] text-typography-500 uppercase font-bold">BAK</span>
                </div>
                <div>
                  <span className="text-xs font-black text-poop-brown block">14</span>
                  <span className="text-[8px] text-typography-500 uppercase font-bold">BAB</span>
                </div>
                <div>
                  <span className="text-xs font-black text-secondary-500 block">5</span>
                  <span className="text-[8px] text-typography-500 uppercase font-bold">Kombo</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-outline-200 rounded-xl p-3 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-secondary-0 flex items-center justify-center text-xs">
                  ☁️
                </div>
                <div>
                  <span className="text-xs font-extrabold text-typography-900 block">Cadangan Opsional</span>
                  <span className="text-[9px] text-secondary-500 font-semibold">Terenkripsi otomatis</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-primary-500 bg-primary-0 px-2.5 py-0.5 rounded-full">
                Aktif
              </span>
            </div>

            <div className="bg-white border border-outline-200 rounded-xl p-3 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-0 flex items-center justify-center text-xs">
                  🔒
                </div>
                <div>
                  <span className="text-xs font-extrabold text-typography-900 block">Kunci Biometrik</span>
                  <span className="text-[9px] text-typography-500">Face ID &amp; Sidik Jari</span>
                </div>
              </div>
              <div className="w-9 h-5 rounded-full bg-primary-500 flex items-center justify-end px-0.5">
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setScreen('auth')}
              className="w-full py-2.5 rounded-full bg-white border border-outline-200 text-xs font-bold text-typography-900 hover:border-primary-500 hover:text-primary-500 flex items-center justify-center gap-2 transition"
            >
              <span>Ganti Akun / Masuk Google</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ============================== */}
        {/* G. AUTH SCREEN                 */}
        {/* ============================== */}
        {activeScreen === 'auth' && (
          <div className="flex-1 flex flex-col items-center justify-center p-5 bg-background-50">
            <div className="flex items-center gap-1.5 mb-2">
              <MrPlopSVG className="w-9 h-9" />
              <LilDripSVG className="w-9 h-9" />
              <SirFlushSVG className="w-10 h-10" />
            </div>

            <h3 className="text-base font-black text-typography-900">GoFlushly</h3>
            <p className="text-[10px] text-typography-500 mb-4 text-center">
              Masuk untuk cadangkan riwayat secara privat
            </p>

            <div className="w-full bg-white border border-outline-200 rounded-2xl p-4 space-y-3 shadow-sm">
              <div>
                <label className="text-[9px] font-bold text-typography-600 uppercase block mb-1">Email</label>
                <div className="h-9 px-3 rounded-xl bg-background-50 border border-outline-200 flex items-center text-xs text-typography-900">
                  user@goflushly.app
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-bold text-typography-600 uppercase">Kata Sandi</label>
                  <span className="text-[9px] text-primary-500 font-bold">Lupa?</span>
                </div>
                <div className="h-9 px-3 rounded-xl bg-background-50 border border-outline-200 flex items-center text-xs text-typography-400">
                  ••••••••••••
                </div>
              </div>

              <button
                type="button"
                onClick={() => setScreen('profile')}
                className="w-full h-9 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center shadow-sm transition-colors"
              >
                Masuk Akun
              </button>

              <button
                type="button"
                onClick={() => setScreen('profile')}
                className="w-full h-9 rounded-full bg-white border border-outline-200 hover:border-primary-500 text-typography-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span className="font-black text-primary-500">G</span>
                <span>Lanjutkan dengan Google</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setScreen('map')}
              className="mt-4 text-[11px] text-typography-500 hover:text-primary-500 underline font-semibold"
            >
              Lewati, Lanjutkan Offline
            </button>
          </div>
        )}
      </div>

      {/* 3. CRISP WHITE BOTTOM BAR WITH ROYAL BLUE (+) FAB */}
      <nav className="h-16 bg-white border-t border-outline-100 px-5 flex items-center justify-between relative z-30 select-none">
        <button
          type="button"
          onClick={() => setScreen('map')}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            activeScreen === 'map' ? 'text-primary-500 font-bold' : 'text-typography-400 hover:text-typography-900'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px]">Peta</span>
        </button>

        <button
          type="button"
          onClick={() => setScreen('timeline')}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            activeScreen === 'timeline' ? 'text-primary-500 font-bold' : 'text-typography-400 hover:text-typography-900'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Diary</span>
        </button>

        {/* Centered Elevated Royal Blue (+) FAB */}
        <div className="-mt-9 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setScreen(activeScreen === 'quick-log' ? 'map' : 'quick-log')}
            className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/35 border-4 border-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Catat Cepat"
          >
            <Plus className="w-7 h-7 stroke-[2.8]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setScreen('stats')}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            activeScreen === 'stats' ? 'text-primary-500 font-bold' : 'text-typography-400 hover:text-typography-900'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">Stats</span>
        </button>

        <button
          type="button"
          onClick={() => setScreen('profile')}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            activeScreen === 'profile' || activeScreen === 'auth'
              ? 'text-primary-500 font-bold'
              : 'text-typography-400 hover:text-typography-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profil</span>
        </button>
      </nav>

      {/* 4. HOME BAR INDICATOR */}
      <div className="h-4 bg-white flex items-center justify-center pb-1">
        <div className="w-28 h-1 bg-outline-300 rounded-full" />
      </div>
    </div>
  );
};
