import React, { useState } from 'react';
import { MessageSquarePlus, Send, Sparkles, CheckCircle2, AlertCircle, Heart, Bug, Lightbulb, MessageCircle, Star } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useWebCopy } from '../i18n/translations';
import { submitFeedback } from '../services/adminApi';
import { FeedbackCategory } from '../types/admin';
import { MrPlopSVG, LilDripSVG, SirFlushSVG } from './MascotSVGs';
import { Card, Heading, Text, Badge, BadgeText, Button, ButtonText, Input, Textarea } from './ui';

const CATEGORY_ICONS: Record<FeedbackCategory, React.ElementType> = {
  SUGGESTION: Lightbulb,
  BUG: Bug,
  PRAISE: Heart,
  OTHER: MessageCircle,
};

export const FeedbackSection: React.FC = () => {
  const { lang } = useLanguage();
  const copy = useWebCopy(lang).feedback;

  const [category, setCategory] = useState<FeedbackCategory>('SUGGESTION');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitFeedback({
        category,
        rating,
        message,
        email: email.trim() || undefined,
        platform: 'WEB',
      });

      if (!res.ok) {
        setErrorMessage(res.error || copy.errorMsg);
      } else {
        setSubmitted(true);
        setMessage('');
        setEmail('');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : copy.errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setMessage('');
    setEmail('');
    setCategory('SUGGESTION');
    setRating(5);
    setErrorMessage(null);
  };

  return (
    <section id="feedback" className="py-20 px-4 md:px-8 border-t border-[#E2E8F0] relative overflow-hidden bg-[#F8FAFC]">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge action="secondary" size="lg" className="mb-4">
            <MessageSquarePlus className="w-4 h-4" />
            <BadgeText>{copy.pill}</BadgeText>
          </Badge>
          <Heading as="h2" size="2xl" className="mb-3">
            {copy.title}
          </Heading>
          <Text size="md" className="max-w-xl mx-auto">
            {copy.subtitle}
          </Text>
        </div>

        {/* Content Box (Gluestack Card) */}
        <Card variant="outline" size="lg" className="shadow-sm relative overflow-hidden">
          {submitted ? (
            <div className="text-center py-8 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-center gap-3">
                <div className="w-16 h-16 bg-[#FDE6C9] rounded-2xl flex items-center justify-center p-2.5">
                  <MrPlopSVG />
                </div>
                <div className="w-16 h-16 bg-[#C6F6E2] rounded-2xl flex items-center justify-center p-2.5">
                  <SirFlushSVG />
                </div>
                <div className="w-16 h-16 bg-[#D4F0FF] rounded-2xl flex items-center justify-center p-2.5">
                  <LilDripSVG />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-secondary-500 text-xs font-bold uppercase tracking-wider bg-secondary-0 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  Sent Successfully
                </div>
                <Heading as="h3" size="xl">
                  {copy.successTitle}
                </Heading>
                <Text size="sm" className="max-w-md mx-auto leading-relaxed">
                  {copy.successDesc}
                </Text>
              </div>

              <div>
                <Button action="white" size="md" onClick={handleReset}>
                  <ButtonText>{copy.sendAnother}</ButtonText>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-typography-600 uppercase tracking-wider mb-2.5">
                  {copy.categoryLabel}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['SUGGESTION', 'BUG', 'PRAISE', 'OTHER'] as FeedbackCategory[]).map((cat) => {
                    const isSelected = category === cat;
                    const Icon = CATEGORY_ICONS[cat];
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-full border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                            : 'bg-background-50 border-outline-200 text-typography-600 hover:border-primary-500/40 hover:bg-background-0'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{copy.categories[cat]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold text-typography-600 uppercase tracking-wider mb-2">
                  {copy.ratingLabel}
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
                      title={`${star} star`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'fill-[#FBBF24] text-[#FBBF24]'
                            : 'fill-transparent text-[#CBD5E1]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-typography-600 ml-2">
                    {rating === 5 ? 'Luar Biasa / Awesome!' : rating >= 4 ? 'Puas / Great' : rating >= 3 ? 'Cukup / Good' : 'Butuh Perbaikan'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-typography-600 uppercase tracking-wider mb-2">
                  {copy.messageLabel} <span className="text-emergency">*</span>
                </label>
                <Textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={copy.messagePlaceholder}
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-bold text-typography-600 uppercase tracking-wider mb-2">
                  {copy.emailLabel}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.emailPlaceholder}
                />
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emergency/10 border border-emergency/30 text-emergency text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="text-xs text-typography-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-secondary-500" />
                  <span>Kritik &amp; saran langsung dibaca tim pengembang.</span>
                </div>

                <Button
                  type="submit"
                  action="primary"
                  size="lg"
                  disabled={submitting}
                >
                  <Send className="w-4 h-4" />
                  <ButtonText>{submitting ? copy.submitting : copy.submitBtn}</ButtonText>
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
};

