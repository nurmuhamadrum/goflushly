import React, { useState } from 'react';
import { MrPlopSVG } from './MascotSVGs';
import { Menu, X } from 'lucide-react';
import { Box, HStack, Button, ButtonText } from './ui';
import { useLanguage } from '../i18n/LanguageContext';
import { useWebCopy } from '../i18n/translations';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const t = useWebCopy(lang).nav;

  const toggleLang = () => setLang(lang === 'id' ? 'en' : 'id');

  return (
    <header className="sticky top-0 z-50 pt-3 pb-2 px-4 sm:px-6 bg-background-50/85 backdrop-blur-md">
      <Box className="max-w-6xl mx-auto bg-background-0 border border-outline-200 rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4 shadow-sm">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group min-w-0">
          <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <MrPlopSVG className="w-9 h-9" />
          </div>
          <span className="font-extrabold text-base sm:text-lg text-typography-900 tracking-tight truncate">
            GoFlushly
          </span>
        </a>

        {/* Clean Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-typography-600">
          <a href="#maskot" className="hover:text-primary-500 transition-colors">
            {t.mascots}
          </a>
          <a href="#fitur" className="hover:text-primary-500 transition-colors">
            {t.features}
          </a>
          <a href="#privasi" className="hover:text-primary-500 transition-colors">
            {t.privacy}
          </a>
          <a href="#faq" className="hover:text-primary-500 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Controls: Language Pill + Gluestack Primary Button */}
        <HStack space="sm">
          <button
            type="button"
            onClick={toggleLang}
            title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-100 hover:bg-outline-200 border border-outline-200 text-xs font-bold text-typography-900 transition-colors"
          >
            {lang === 'id' ? (
              <svg className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10 overflow-hidden shadow-xs" viewBox="0 0 24 24">
                <rect width="24" height="12" fill="#EF4444" />
                <rect y="12" width="24" height="12" fill="#FFFFFF" />
              </svg>
            ) : (
              <svg className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10 overflow-hidden shadow-xs" viewBox="0 0 24 24">
                <rect width="24" height="24" fill="#012169" />
                <path d="M0 0L24 24M24 0L0 24" stroke="#FFFFFF" strokeWidth="4" />
                <path d="M0 0L24 24M24 0L0 24" stroke="#C8102E" strokeWidth="2.2" />
                <path d="M12 0V24M0 12H24" stroke="#FFFFFF" strokeWidth="6" />
                <path d="M12 0V24M0 12H24" stroke="#C8102E" strokeWidth="3.6" />
              </svg>
            )}
            <span>{lang.toUpperCase()}</span>
          </button>

          <Button href="#support" action="primary" size="sm">
            <ButtonText className="hidden sm:inline">
              {lang === 'en' ? 'Support Saweria' : 'Dukung Saweria'}
            </ButtonText>
            <ButtonText className="sm:hidden">Saweria</ButtonText>
          </Button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-background-50 border border-outline-200 text-typography-900"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </HStack>
      </Box>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <Box className="md:hidden max-w-6xl mx-auto mt-2 bg-background-0 border border-outline-200 rounded-2xl p-4 shadow-lg animate-fadeIn">
          <nav className="flex flex-col space-y-1 text-sm font-semibold text-typography-600">
            <a href="#maskot" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-background-50 hover:text-primary-500">
              {t.mascots}
            </a>
            <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-background-50 hover:text-primary-500">
              {t.features}
            </a>
            <a href="#privasi" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-background-50 hover:text-primary-500">
              {t.privacy}
            </a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-background-50 hover:text-primary-500">
              FAQ
            </a>
          </nav>
        </Box>
      )}
    </header>
  );
};
