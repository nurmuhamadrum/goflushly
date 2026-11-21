import React from 'react';
import { Card, HStack, Heading, Text, Button, ButtonText } from './ui';
import { useLanguage } from '../i18n/LanguageContext';

export const DownloadSection: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  return (
    <section id="download" className="py-6 bg-background-50">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <Card
          variant="outline"
          size="md"
          className="px-6 sm:px-8 py-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6"
        >
          <div className="text-center lg:text-left">
            <Text size="sm" bold className="text-secondary-500">
              Download
            </Text>
            <Heading as="h2" size="lg" className="mt-0.5">
              {isEn ? 'Coming Soon & Open Source' : 'Segera Hadir & Open Source'}
            </Heading>
          </div>

          <HStack space="md" className="flex-wrap justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background-900 text-white shadow-xs select-none">
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M3.6 2.3C3.2 2.7 3 3.3 3 4.1V19.9C3 20.7 3.2 21.3 3.6 21.7L3.7 21.8L12.9 12.6V12V11.4L3.7 2.2L3.6 2.3Z" fill="#38BDF8" />
                <path d="M16 15.7L12.9 12.6V12V11.4L16 8.3L16.1 8.4L19.8 10.5C20.8 11.1 20.8 12.1 19.8 12.7L16.1 14.8L16 15.7Z" fill="#FBBF24" />
                <path d="M16.1 14.8L12.9 12L3.6 21.7C4 22.1 4.6 22.1 5.4 21.7L16.1 14.8Z" fill="#EF4444" />
                <path d="M16.1 8.4L5.4 2.3C4.6 1.9 4 1.9 3.6 2.3L12.9 12L16.1 8.4Z" fill="#34D399" />
              </svg>
              <div className="text-left leading-tight">
                <span className="block text-sm font-extrabold">Google Play</span>
                <span className="block text-[10px] text-typography-400 font-semibold">Coming Soon</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background-900 text-white shadow-xs select-none">
              <svg className="w-6 h-6 flex-shrink-0 fill-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.78-.96 2.84 1.04.08 2.08-.52 2.72-1.3z" />
              </svg>
              <div className="text-left leading-tight">
                <span className="block text-sm font-extrabold">App Store</span>
                <span className="block text-[10px] text-typography-400 font-semibold">Coming Soon</span>
              </div>
            </div>

            <Button
              href="https://github.com/nurmuhamadrum/pooppeelog"
              target="_blank"
              rel="noreferrer"
              action="primary"
              size="md"
              className="px-7"
            >
              <ButtonText>GitHub</ButtonText>
            </Button>
          </HStack>
        </Card>
      </div>
    </section>
  );
};
