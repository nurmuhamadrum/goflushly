import React from 'react';
import { Card, Heading, Text, Button, ButtonText } from './ui';
import { useLanguage } from '../i18n/LanguageContext';
import { Heart } from 'lucide-react';

export const BuyMeACoffeeSection: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  return (
    <section id="support" className="py-8 md:py-12 bg-background-50">
      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        <Card
          variant="highlighted"
          size="lg"
          className="relative text-center p-8 sm:p-10 flex flex-col items-center shadow-md bg-white border border-primary-100"
        >
          {/* Decorative Mascot / Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-500 mb-5 shadow-xs">
            <Heart className="w-8 h-8 fill-primary-500 text-primary-500 animate-pulse" />
          </div>

          <Heading as="h3" size="2xl" className="font-extrabold text-typography-900 tracking-tight">
            {isEn ? 'Support GoFlushly Development' : 'Dukung Pengembangan GoFlushly'}
          </Heading>

          <Text size="md" className="mt-3 text-typography-600 leading-relaxed max-w-xl mx-auto">
            {isEn
              ? 'GoFlushly is 100% free, privacy-first, and zero-ad. Your donation directly supports server maintenance, custom domain, and developing new features with our mascot trio.'
              : 'GoFlushly 100% gratis, tanpa iklan, dan menjaga privasi penuh. Dukungan sukarela darimu sangat berarti untuk biaya server, domain, serta pembuatan fitur dan maskot baru.'}
          </Text>

          {/* Single Saweria CTA Button */}
          <div className="mt-7 w-full max-w-xs">
            <Button
              href="https://saweria.co/goflushly"
              target="_blank"
              rel="noreferrer"
              action="primary"
              size="lg"
              className="w-full py-3.5 px-6 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            >
              <span className="text-xl">☕</span>
              <ButtonText className="text-base font-bold">
                {isEn ? 'Dukung via Saweria' : 'Dukung via Saweria'}
              </ButtonText>
            </Button>
          </div>

          <Text size="xs" className="mt-4 text-typography-400 font-medium">
            {isEn
              ? 'Accepts QRIS, GoPay, OVO, Dana, LinkAja & ShopeePay'
              : 'Menerima QRIS, GoPay, OVO, DANA, LinkAja & ShopeePay'}
          </Text>
        </Card>
      </div>
    </section>
  );
};
