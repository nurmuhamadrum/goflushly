import React from 'react';
import { Card, Heading, Text, Badge, BadgeText, Button, ButtonText } from './ui';
import { useLanguage } from '../i18n/LanguageContext';

export const BuyMeACoffeeSection: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const tiers = [
    {
      id: 1,
      price: isEn ? '$1 / Rp 10k' : 'Rp 10rb',
      desc: isEn
        ? 'Treat the developer to a warm cup of coffee.'
        : 'Traktir kopi hangat untuk developer.',
      popular: false,
    },
    {
      id: 2,
      price: isEn ? '$2 / Rp 25k' : 'Rp 25rb',
      desc: isEn
        ? 'Support new features and fresh 3D mascots.'
        : 'Dukung fitur dan maskot baru.',
      popular: true,
    },
    {
      id: 3,
      price: isEn ? '$4 / Rp 50k' : 'Rp 50rb',
      desc: isEn
        ? 'Special support to keep PoopPeeLog ad-free.'
        : 'Dukungan spesial untuk PoopPeeLog.',
      popular: false,
    },
  ];

  return (
    <section id="support" className="py-8 md:py-12 bg-background-50">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              variant={tier.popular ? 'highlighted' : 'elevated'}
              size="lg"
              className="relative text-center flex flex-col justify-between hover:-translate-y-1"
            >
              {tier.popular && (
                <Badge
                  action="solidPrimary"
                  size="lg"
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1"
                >
                  <BadgeText>{isEn ? 'Popular' : 'Populer'}</BadgeText>
                </Badge>
              )}

              <div className="pt-1 pb-6">
                <Heading as="h3" size="2xl">
                  {tier.price}
                </Heading>
                <Text size="sm" className="mt-2 leading-relaxed max-w-[200px] mx-auto">
                  {tier.desc}
                </Text>
              </div>

              <Button
                href="https://saweria.co/pooppeelog"
                target="_blank"
                rel="noreferrer"
                action="primary"
                size="md"
                className="w-full"
              >
                <ButtonText>{isEn ? 'Support via Saweria' : 'Dukung via Saweria'}</ButtonText>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
