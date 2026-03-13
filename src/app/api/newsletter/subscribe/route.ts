import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { sendNewsletterConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });

  const supabase = createServerSupabase();

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: email.toLowerCase().trim() });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Déjà inscrit' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await sendNewsletterConfirmationEmail({ to: email.toLowerCase().trim() });
  } catch (err) {
    console.error('[newsletter] confirmation email error:', err);
  }

  return NextResponse.json({ success: true });
}
