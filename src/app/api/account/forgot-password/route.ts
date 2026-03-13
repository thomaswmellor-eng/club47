import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  const supabase = createServerSupabase();

  const normalizedEmail = email.toLowerCase().trim();

  // Récupérer le nom du membre pour personnaliser l'email (sans filtres restrictifs)
  const { data: membre } = await supabase
    .from('membres')
    .select('name')
    .eq('email', normalizedEmail)
    .single();

  // Si pas de membre trouvé, on retourne quand même success (anti-énumération)
  // mais on n'envoie rien
  if (!membre) {
    return NextResponse.json({ success: true });
  }

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: { redirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/account/reset-password' },
    });

    if (error || !data?.properties?.action_link) {
      console.error('[forgot-password] generateLink error:', error);
      return NextResponse.json({ success: true });
    }

    console.log('[forgot-password] link generated, sending to:', normalizedEmail);
    await sendPasswordResetEmail({
      to: normalizedEmail,
      name: membre.name,
      resetLink: data.properties.action_link,
    });
    console.log('[forgot-password] email sent successfully');
  } catch (err) {
    console.error('[forgot-password] email error:', err);
  }

  return NextResponse.json({ success: true });
}
