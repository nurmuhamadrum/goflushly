import React, { useEffect, useState } from 'react';
import { getBadges, CONTENT_UPDATED_EVENT } from '../data/contentStore';
import { EditableBadge } from '../types/admin';
import { MrPlopSVG, LilDripSVG, SirFlushSVG } from './MascotSVGs';
import { Award, Compass, Flame, MapPin, Mountain } from 'lucide-react';
import { Card, Badge, BadgeText, Heading, Text, VStack } from './ui';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchBadgesFromSupabase } from '../services/adminApi';
import { useLanguage } from '../i18n/LanguageContext';
import { useWebCopy } from '../i18n/translations';

export const BadgesSection: React.FC = () => {
  const { lang } = useLanguage();
  const t = useWebCopy(lang).badges;
  const [badges, setBadges] = useState<EditableBadge[]>(getBadges);

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchBadgesFromSupabase()
        .then((remote) => {
          if (remote.length > 0) setBadges(remote);
        })
        .catch(() => {});
    }

    const refresh = () => setBadges(getBadges());
    window.addEventListener(CONTENT_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CONTENT_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'award':
        return <Award className="w-3.5 h-3.5 text-primary-500" />;
      case 'compass':
        return <Compass className="w-3.5 h-3.5 text-poop-brown" />;
      case 'flame':
        return <Flame className="w-3.5 h-3.5 text-emergency" />;
      case 'map-pin':
        return <MapPin className="w-3.5 h-3.5 text-primary-500" />;
      case 'mountain':
        return <Mountain className="w-3.5 h-3.5 text-secondary-500" />;
      default:
        return <Award className="w-3.5 h-3.5 text-primary-500" />;
    }
  };

  const getMascotBgColor = (mascot: string) => {
    switch (mascot) {
      case 'MR_PLOP':
        return 'bg-[#FDE6C9]';
      case 'LIL_DRIP':
        return 'bg-[#D4F0FF]';
      case 'SIR_FLUSH':
        return 'bg-[#C6F6E2]';
      default:
        return 'bg-[#D4F0FF]';
    }
  };

  const getMascotSVG = (mascot: string) => {
    switch (mascot) {
      case 'MR_PLOP':
        return <MrPlopSVG />;
      case 'LIL_DRIP':
        return <LilDripSVG />;
      case 'SIR_FLUSH':
        return <SirFlushSVG />;
      default:
        return <LilDripSVG />;
    }
  };

  return (
    <section id="lencana" className="py-16 sm:py-20 md:py-24 bg-background-50 border-b border-outline-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        {/* Section Header */}
        <VStack space="sm" className="text-center max-w-2xl mx-auto mb-12 items-center">
          <Badge action="secondary" size="lg">
            <Award className="w-3.5 h-3.5" />
            <BadgeText>{t.pill}</BadgeText>
          </Badge>
          <Heading as="h2" size="2xl">
            {t.title}
          </Heading>
          <Text size="sm" className="leading-relaxed">
            {t.subtitle}
          </Text>
        </VStack>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              variant="elevated"
              size="sm"
              className="group p-4 sm:p-5 text-left sm:text-center hover:border-primary-500/60 hover:-translate-y-1 flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-4 sm:gap-0"
            >
              <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3.5 sm:gap-0 flex-1 min-w-0">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${getMascotBgColor(
                    badge.mascot
                  )} p-2.5 sm:mx-auto sm:mb-4 shadow-xs group-hover:scale-110 transition-transform flex items-center justify-center flex-shrink-0`}
                >
                  {getMascotSVG(badge.mascot)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-background-50 text-[10px] font-bold text-typography-600 mb-1.5 border border-outline-200">
                    {getBadgeIcon(badge.iconName)}
                    <span>{badge.category}</span>
                  </div>

                  <Heading as="h3" size="sm" className="mb-1 truncate sm:whitespace-normal">
                    {lang === 'en' && badge.titleEn ? badge.titleEn : badge.title}
                  </Heading>
                  <Text size="xs" className="leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {lang === 'en' && badge.descriptionEn ? badge.descriptionEn : badge.description}
                  </Text>

                  <span className="sm:hidden inline-block mt-2 text-[10px] text-secondary-500 font-bold bg-secondary-0 px-2.5 py-0.5 rounded-full">
                    {lang === 'en' && badge.requirementTextEn ? badge.requirementTextEn : badge.requirementText}
                  </span>
                </div>
              </div>

              <div className="hidden sm:block mt-4 pt-3 border-t border-outline-100">
                <span className="text-[10px] text-secondary-500 font-bold bg-secondary-0 px-2.5 py-1 rounded-full block">
                  {lang === 'en' && badge.requirementTextEn ? badge.requirementTextEn : badge.requirementText}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
