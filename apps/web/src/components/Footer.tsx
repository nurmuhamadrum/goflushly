import React from 'react';
import { MrPlopSVG } from './MascotSVGs';
import { VStack, Heading, Text } from './ui';
import { useLanguage } from '../i18n/LanguageContext';

export const Footer: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  return (
    <footer className="bg-background-0 border-t border-outline-200 pt-12 pb-8 text-typography-600">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-outline-100">
          {/* Brand Column */}
          <VStack space="sm" className="col-span-2 md:col-span-1">
            <a href="#" className="inline-flex items-center gap-2.5">
              <MrPlopSVG className="w-8 h-8" />
              <span className="font-extrabold text-lg text-typography-900 tracking-tight">
                GoFlushly
              </span>
            </a>
            <Text size="xs" className="text-typography-500 leading-relaxed">
              {isEn
                ? 'Track. Log. Relieved. Your clean, soft & private daily digestive companion.'
                : 'Catat. Pantau. Plong. Teman harian pencernaan & hidrasi yang ramah dan 100% privat.'}
            </Text>
          </VStack>

          {/* Produk */}
          <div>
            <Heading as="h4" size="sm" className="mb-3">
              {isEn ? 'Product' : 'Produk'}
            </Heading>
            <ul className="space-y-2 text-xs sm:text-sm text-typography-600">
              <li><a href="#maskot" className="hover:text-primary-500 transition-colors">{isEn ? 'Mascots' : 'Maskot'}</a></li>
              <li><a href="#fitur" className="hover:text-primary-500 transition-colors">{isEn ? 'Features' : 'Fitur'}</a></li>
              <li><a href="#preview" className="hover:text-primary-500 transition-colors">{isEn ? 'Interactive Demo' : 'Demo Interaktif'}</a></li>
              <li><a href="#lencana" className="hover:text-primary-500 transition-colors">{isEn ? 'Badges' : 'Lencana'}</a></li>
            </ul>
          </div>

          {/* Privasi */}
          <div>
            <Heading as="h4" size="sm" className="mb-3">
              {isEn ? 'Privacy' : 'Privasi'}
            </Heading>
            <ul className="space-y-2 text-xs sm:text-sm text-typography-600">
              <li><a href="#privasi" className="hover:text-primary-500 transition-colors">{isEn ? 'Local Storage' : 'Privasi Lokal'}</a></li>
              <li><a href="#faq" className="hover:text-primary-500 transition-colors">FAQ</a></li>
              <li><a href="#/admin" className="hover:text-primary-500 transition-colors">Admin</a></li>
            </ul>
          </div>

          {/* Komunitas */}
          <div>
            <Heading as="h4" size="sm" className="mb-3">
              {isEn ? 'Community' : 'Komunitas'}
            </Heading>
            <ul className="space-y-2 text-xs sm:text-sm text-typography-600">
              <li><a href="#support" className="hover:text-primary-500 transition-colors">{isEn ? 'Support Saweria' : 'Dukung Saweria'}</a></li>
              <li><a href="#feedback" className="hover:text-primary-500 transition-colors">{isEn ? 'Send Feedback' : 'Kirim Masukan'}</a></li>
              <li>
                <a
                  href="https://github.com/nurmuhamadrum/pooppeelog"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary-500 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 text-center text-xs text-typography-500">
          Copyright &copy; 2026 GoFlushly. {isEn ? 'Not a medical diagnostic tool.' : 'Bukan alat diagnosis medis.'}
        </div>
      </div>
    </footer>
  );
};
