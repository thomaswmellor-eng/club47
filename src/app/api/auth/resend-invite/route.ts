import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email?.trim()) {
    return NextResponse.json({ success: true }); // ne pas révéler les erreurs
  }

  const normalized = email.toLowerCase().trim();
  const supabase = createServerSupabase();

  // Vérifier que l'email a bien une demande acceptée
  const { data: req } = await supabase
    .from('member_requests')
    .select('id, proposed_name, proposed_email')
    .eq('proposed_email', normalized)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!req) {
    return NextResponse.json({ success: true }); // silencieux si pas trouvé
  }

  // Vérifier que le membre n'a pas déjà complété son inscription
  const { data: existing } = await supabase
    .from('membres')
    .select('id')
    .eq('email', normalized)
    .eq('is_active', true)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true }); // déjà membre, ne rien faire
  }

  // Générer un nouveau lien
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/complete-setup`;
  let { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: normalized,
    options: { redirectTo },
  });

  // Si pas de compte auth, essayer invite
  if (linkError) {
    ({ data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: normalized,
      options: { redirectTo, data: { name: req.proposed_name, request_id: req.id } },
    }));
  }

  const actionLink = linkData?.properties?.action_link;
  if (!linkError && actionLink) {
    try {
      await sendWelcomeEmail({ to: normalized, name: req.proposed_name, inviteLink: actionLink });
    } catch (err) {
      console.error('[resend-invite] email error:', err);
    }
  }

  return NextResponse.json({ success: true });
}
