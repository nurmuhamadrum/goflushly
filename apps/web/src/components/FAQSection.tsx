import React, { useEffect, useState } from 'react';
import { getFaqs, CONTENT_UPDATED_EVENT } from '../data/contentStore';
import { EditableFAQ } from '../types/admin';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { Heading, Text, Badge, BadgeText, Accordion, AccordionItem, AccordionTrigger, AccordionContent, Button, ButtonText } from './ui';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchFaqsFromSupabase } from '../services/adminApi';
import { useLanguage } from '../i18n/LanguageContext';

export const FAQSection: React.FC = () => {
  const { lang } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<EditableFAQ[]>(getFaqs);

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchFaqsFromSupabase(true)
        .then((remote) => {
          if (remote.length > 0) setFaqs(remote);
        })
        .catch(() => {});
    }

    const refresh = () => setFaqs(getFaqs());
    window.addEventListener(CONTENT_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CONTENT_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const FAQS = faqs.filter((f) => f.isActive).sort((a, b) => a.order - b.order);

  return (
    <section id="faq" className="py-20 md:py-28 bg-background-50 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge action="secondary" size="lg" className="mb-3.5 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <BadgeText>{lang === 'en' ? 'Frequently Asked Questions' : 'Pertanyaan Sering Diajukan'}</BadgeText>
          </Badge>
          <Heading as="h2" size="2xl" className="font-extrabold text-typography-900 tracking-tight">
            FAQ
          </Heading>
          <Text size="sm" className="mt-2 text-typography-600 max-w-md mx-auto leading-relaxed">
            {lang === 'en'
              ? 'Everything you need to know about PoopPeeLog privacy, speed, and offline mechanics.'
              : 'Semua hal penting seputar privasi data, kecepatan catat, dan cara kerja offline PoopPeeLog.'}
          </Text>
        </div>

        {/* Accordion List */}
        <Accordion className="space-y-3.5">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <AccordionItem
                key={faq.id || index}
                isOpen={isOpen}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white shadow-xs ${
                  isOpen
                    ? 'border-primary-400 border-l-4 border-l-primary-500 shadow-md'
                    : 'border-outline-100 hover:border-outline-200'
                }`}
              >
                <AccordionTrigger
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="px-5 py-4 font-extrabold text-typography-900 flex items-center justify-between gap-4 text-left"
                >
                  <span className="text-sm sm:text-base">
                    {lang === 'en' && faq.qEn ? faq.qEn : faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isOpen ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-typography-500'
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </AccordionTrigger>
                {isOpen && (
                  <AccordionContent className="px-5 pb-5 pt-1 text-sm text-typography-600 leading-relaxed border-t border-slate-50">
                    {lang === 'en' && faq.aEn ? faq.aEn : faq.a}
                  </AccordionContent>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Callout Help Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-slate-100/80 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="block text-sm font-black text-typography-900">
              {lang === 'en' ? 'Still have questions or feature suggestions?' : 'Punya pertanyaan atau usulan fitur lainnya?'}
            </span>
            <span className="block text-xs text-typography-500 mt-0.5">
              {lang === 'en'
                ? 'Drop us a direct note via our feedback box above.'
                : 'Sampaikan langsung ide atau masukanmu lewat formulir feedback di atas.'}
            </span>
          </div>

          <Button href="#feedback" action="white" size="sm" className="rounded-xl bg-white border-slate-300 font-bold whitespace-nowrap shadow-xs">
            <MessageSquare className="w-4 h-4 text-primary-500" />
            <ButtonText>{lang === 'en' ? 'Send Feedback' : 'Kirim Feedback'}</ButtonText>
          </Button>
        </div>
      </div>
    </section>
  );
};
