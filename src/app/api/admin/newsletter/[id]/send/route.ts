import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { sendNewsletterCampaign } from '@/lib/email';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try { await verifyAdminToken(token); } catch { return NextResponse.json({ error: 'Non autorisé' }, { status: 401 }); }

  const { id } = await params;
  const supabase = createServerSupabase();

  // Fetch the newsletter
  const { data: newsletter, error: nlError } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .eq('status', 'draft')
    .single();

  if (nlError || !newsletter) {
    return NextResponse.json({ error: 'Newsletter introuvable ou déjà envoyée.' }, { status: 404 });
  }

  // Fetch all subscribers
  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('email');

  const emails = subscribers?.map((s: { email: string }) => s.email) ?? [];
  if (emails.length === 0) {
    return NextResponse.json({ error: 'Aucun abonné.' }, { status: 400 });
  }

  // Send to all subscribers (sequential to avoid rate limits)
  let sent = 0;
  for (const email of emails) {
    try {
      await sendNewsletterCampaign({ to: email, subject: newsletter.subject, body: newsletter.body });
      sent++;
    } catch (err) {
      console.error('[newsletter] Failed to send to', email, err);
    }
  }

  // Mark as sent
  await supabase
    .from('newsletters')
    .update({ status: 'sent', sent_at: new Date().toISOString(), recipient_count: sent })
    .eq('id', id);

  return NextResponse.json({ success: true, sent });
}
