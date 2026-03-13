import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  // Vérifier que l'appelant est un admin
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  let adminName: string;
  try {
    const payload = await verifyAdminToken(token);
    adminName = payload.name;
  } catch {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const { request_id } = await request.json();
  if (!request_id) return NextResponse.json({ error: 'request_id manquant.' }, { status: 400 });

  const supabase = createServerSupabase();

  // Récupérer la demande
  const { data: req, error: fetchError } = await supabase
    .from('member_requests')
    .select('*')
    .eq('id', request_id)
    .single();

  if (fetchError || !req) {
    return NextResponse.json({ error: 'Demande introuvable.' }, { status: 404 });
  }

  if (req.status !== 'pending') {
    return NextResponse.json({ error: 'Cette demande a déjà été traitée.' }, { status: 409 });
  }

  // Générer le lien d'invitation Supabase Auth
  // Si l'utilisateur a déjà un compte auth (ex: compte de test), on envoie un recovery à la place
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/complete-setup`;
  let { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'invite',
    email: req.proposed_email,
    options: { redirectTo, data: { name: req.proposed_name, request_id: req.id } },
  });

  if (linkError?.code === 'email_exists') {
    ({ data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: req.proposed_email,
      options: { redirectTo },
    }));
  }

  if (linkError) {
    console.error('[accept-request] generateLink error:', linkError);
    return NextResponse.json({ error: `Erreur Supabase : ${linkError.message}` }, { status: 500 });
  }

  const actionLink = linkData?.properties?.action_link;
  if (!actionLink) {
    console.error('[accept-request] generateLink returned no action_link. data:', JSON.stringify(linkData));
    return NextResponse.json({ error: 'Lien d\'invitation non généré.' }, { status: 500 });
  }

  // Envoyer l'e-mail de bienvenue — nodemailer throw en cas d'échec
  try {
    await sendWelcomeEmail({
      to: req.proposed_email,
      name: req.proposed_name,
      inviteLink: actionLink,
    });
  } catch (emailErr) {
    console.error('[accept-request] sendWelcomeEmail error:', emailErr);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'e-mail." }, { status: 500 });
  }

  // Marquer la demande comme acceptée
  await supabase
    .from('member_requests')
    .update({
      status: 'accepted',
      reviewed_by_name: adminName,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', request_id);

  return NextResponse.json({ success: true });
}
