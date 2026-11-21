import React, { useEffect, useState } from 'react';
import { getBadges, CONTENT_UPDATED_EVENT } from '../data/contentStore';
import { EditableBadge } from '../types/admin';
import { Award, Compass, Flame, MapPin, Mountain, Sparkles } from 'lucide-react';
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
        return <Compass className="w-3.5 h-3.5 text-amber-600" />;
      case 'flame':
        return <Flame className="w-3.5 h-3.5 text-orange-500" />;
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
        return 'from-amber-100/90 to-amber-200/60 text-amber-700';
      case 'LIL_DRIP':
        return 'from-sky-100/90 to-sky-200/60 text-sky-700';
      case 'SIR_FLUSH':
        return 'from-emerald-100/90 to-emerald-200/60 text-emerald-700';
      default:
        return 'from-sky-100/90 to-sky-200/60 text-sky-700';
    }
  };

  const getMascotImg = (mascot: string) => {
    switch (mascot) {
      case 'MR_PLOP':
        return '/mascots/mr-plop.png';
      case 'LIL_DRIP':
        return '/mascots/lil-drip.png';
      case 'SIR_FLUSH':
        return '/mascots/sir-flush.png';
      default:
        return '/mascots/lil-drip.png';
    }
  };

  return (
    <section id="lencana" className="py-20 md:py-28 bg-background-50 border-b border-outline-100 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Section Header */}
        <VStack space="sm" className="text-center max-w-2xl mx-auto mb-14 items-center">
          <Badge action="secondary" size="lg" className="shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <BadgeText>{t.pill}</BadgeText>
          </Badge>
          <Heading as="h2" size="2xl" className="font-extrabold text-typography-900 tracking-tight">
            {t.title}
          </Heading>
          <Text size="sm" className="leading-relaxed text-typography-600 max-w-lg">
            {t.subtitle}
          </Text>
        </VStack>

        {/* Badges Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              variant="elevated"
              size="sm"
              className="group p-5 text-left sm:text-center hover:border-primary-400 hover:-translate-y-1.5 transition-all duration-300 rounded-3xl flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-4 sm:gap-0 bg-white border border-outline-100 shadow-sm hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-4 sm:gap-0 flex-1 min-w-0">
                {/* 3D Mascot Trophy Avatar */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b ${getMascotBgColor(
                    badge.mascot
                  )} p-2 sm:mx-auto sm:mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 flex items-center justify-center flex-shrink-0 relative overflow-hidden`}
                >
                  <img
                    src={getMascotImg(badge.mascot)}
                    alt={badge.title}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-md select-none"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 text-[10px] font-extrabold text-typography-700 mb-1.5 border border-slate-200/60 shadow-xs">
                    {getBadgeIcon(badge.iconName)}
                    <span>{badge.category}</span>
                  </div>

                  <Heading as="h3" size="sm" className="mb-1.5 font-black text-typography-900 truncate sm:whitespace-normal">
                    {lang === 'en' && badge.titleEn ? badge.titleEn : badge.title}
                  </Heading>
                  <Text size="xs" className="leading-relaxed text-typography-500 line-clamp-2 sm:line-clamp-none">
                    {lang === 'en' && badge.descriptionEn ? badge.descriptionEn : badge.description}
                  </Text>
                </div>
              </div>

              {/* Requirement Tag */}
              <div className="mt-4 pt-3 border-t border-slate-100 w-full">
                <span className="text-[10px] text-primary-600 font-extrabold bg-primary-50 px-3 py-1 rounded-full block border border-primary-100/60 text-center truncate">
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
