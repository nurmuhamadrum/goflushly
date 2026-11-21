import React, { useState } from 'react';
import { MessageSquarePlus, Send, Sparkles, CheckCircle2, AlertCircle, Heart, Bug, Lightbulb, MessageCircle, Star } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useWebCopy } from '../i18n/translations';
import { submitFeedback } from '../services/adminApi';
import { FeedbackCategory } from '../types/admin';
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
    <section id="feedback" className="py-20 md:py-28 px-4 md:px-8 border-t border-outline-100 relative overflow-hidden bg-[#F8FAFC]">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge action="secondary" size="lg" className="mb-3.5 shadow-xs">
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <BadgeText>{copy.pill}</BadgeText>
          </Badge>
          <Heading as="h2" size="2xl" className="font-extrabold text-typography-900 tracking-tight mb-3">
            {copy.title}
          </Heading>
          <Text size="sm" className="max-w-lg mx-auto text-typography-600 leading-relaxed">
            {copy.subtitle}
          </Text>
        </div>

        {/* Content Box (Gluestack Card) */}
        <Card variant="elevated" size="lg" className="shadow-lg relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-white border border-outline-100">
          {submitted ? (
            <div className="text-center py-8 space-y-6 animate-fadeIn">
              {/* 3D Mascot Trio Celebration */}
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center p-2 shadow-sm border border-amber-100">
                  <img src="/mascots/mr-plop.png" alt="Mr Plop" className="w-12 h-12 object-contain" />
                </div>
                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center p-2 shadow-md border border-emerald-100 transform scale-110">
                  <img src="/mascots/sir-flush.png" alt="Sir Flush" className="w-16 h-16 object-contain" />
                </div>
                <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center p-2 shadow-sm border border-sky-100">
                  <img src="/mascots/lil-drip.png" alt="Lil Drip" className="w-12 h-12 object-contain" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-secondary-600 text-xs font-black uppercase tracking-wider bg-secondary-50 px-3.5 py-1 rounded-full border border-secondary-100">
                  <CheckCircle2 className="w-4 h-4 text-secondary-500" />
                  Terkirim dengan Sukses
                </div>
                <Heading as="h3" size="xl" className="font-extrabold text-typography-900">
                  {copy.successTitle}
                </Heading>
                <Text size="sm" className="max-w-md mx-auto leading-relaxed text-typography-600">
                  {copy.successDesc}
                </Text>
              </div>

              <div>
                <Button action="white" size="md" onClick={handleReset} className="rounded-xl border border-outline-200">
                  <ButtonText className="font-bold">{copy.sendAnother}</ButtonText>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-black text-typography-800 uppercase tracking-wider mb-3">
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
                        className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl border text-xs font-black transition-all ${
                          isSelected
                            ? 'bg-primary-500 text-white border-primary-500 shadow-md transform scale-[1.02]'
                            : 'bg-background-50 border-outline-200 text-typography-600 hover:border-primary-400 hover:bg-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-primary-500'}`} />
                        <span>{copy.categories[cat]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-black text-typography-800 uppercase tracking-wider mb-1">
                    {copy.ratingLabel}
                  </label>
                  <span className="text-xs font-bold text-typography-600">
                    {rating === 5 ? '🌟 Luar Biasa / Awesome!' : rating >= 4 ? '😊 Puas / Great' : rating >= 3 ? '👌 Cukup / Good' : '🔧 Butuh Perbaikan'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      title={`${star} star`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'fill-[#FBBF24] text-[#FBBF24] drop-shadow-xs'
                            : 'fill-transparent text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-black text-typography-800 uppercase tracking-wider mb-2">
                  {copy.messageLabel} <span className="text-emergency">*</span>
                </label>
                <Textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={copy.messagePlaceholder}
                  className="rounded-2xl border-outline-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-sm leading-relaxed"
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-black text-typography-800 uppercase tracking-wider mb-2">
                  {copy.emailLabel}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="rounded-2xl border-outline-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-sm"
                />
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emergency/10 border border-emergency/30 text-emergency text-xs font-bold animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <div className="text-xs text-typography-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-secondary-500" />
                  <span>Kritik &amp; saran langsung dibaca tim pengembang.</span>
                </div>

                <Button
                  type="submit"
                  action="primary"
                  size="lg"
                  disabled={submitting}
                  className="rounded-xl px-7 py-3 shadow-md hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  <ButtonText className="font-extrabold">{submitting ? copy.submitting : copy.submitBtn}</ButtonText>
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
};
