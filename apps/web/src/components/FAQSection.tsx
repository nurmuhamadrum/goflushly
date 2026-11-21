import React, { useEffect, useState } from 'react';
import { getFaqs, CONTENT_UPDATED_EVENT } from '../data/contentStore';
import { EditableFAQ } from '../types/admin';
import { ChevronDown } from 'lucide-react';
import { Heading, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui';
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
    <section id="faq" className="py-16 md:py-20 bg-background-50">
      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        <Heading as="h2" size="2xl" className="text-center mb-8">
          FAQ
        </Heading>

        <Accordion>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <AccordionItem key={faq.id || index} isOpen={isOpen}>
                <AccordionTrigger onClick={() => setOpenIndex(isOpen ? null : index)}>
                  <span className="text-sm sm:text-base">
                    {lang === 'en' && faq.qEn ? faq.qEn : faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-typography-600 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary-500' : ''
                    }`}
                  />
                </AccordionTrigger>
                {isOpen && (
                  <AccordionContent>
                    {lang === 'en' && faq.aEn ? faq.aEn : faq.a}
                  </AccordionContent>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
};
