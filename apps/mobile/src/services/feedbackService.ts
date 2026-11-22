import { supabase } from './supabase';

export type MobileFeedbackCategory = 'SUGGESTION' | 'BUG' | 'PRAISE' | 'OTHER';

export interface MobileSubmitFeedbackPayload {
  category: MobileFeedbackCategory;
  message: string;
  rating?: number;
  email?: string;
  userId?: string;
}

export async function submitMobileFeedback(
  payload: MobileSubmitFeedbackPayload
): Promise<{ ok: boolean; error?: string }> {
  try {
    // Only pass user_id if there is a verified Supabase auth session.
    // In local-first offline mode, local random UUIDs will violate the foreign key constraint on auth.users(id).
    let validAuthUserId: string | null = null;
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        validAuthUserId = data.user.id;
      }
    } catch {
      validAuthUserId = null;
    }

    const { error } = await supabase.from('user_feedbacks').insert({
      category: payload.category,
      message: payload.message.trim(),
      rating: payload.rating || null,
      email: payload.email?.trim() || null,
      platform: 'MOBILE',
      user_id: validAuthUserId,
    });

    if (error) {
      console.warn('[Feedback] Supabase error:', error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Koneksi gagal';
    return { ok: false, error: msg };
  }
}

