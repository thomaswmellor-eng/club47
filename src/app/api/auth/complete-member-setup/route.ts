import { NextResponse } from 'next/server';
import { createServerSupabase, createAnonSupabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json({ error: 'Token manquant.' }, { status: 401 });
  }

  // Vérifier le token et récupérer l'utilisateur
  const anonClient = createAnonSupabase();
  const { data: { user }, error: userError } = await anonClient.auth.getUser(accessToken);

  if (userError || !user) {
    return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
  }

  const supabase = createServerSupabase();

  // Vérifier si le membre existe déjà par email
  const { data: existing } = await supabase
    .from('membres')
    .select('id')
    .eq('email', user.email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, already_exists: true });
  }

  // Trouver la demande acceptée pour cet email
  const { data: req } = await supabase
    .from('member_requests')
    .select('*')
    .eq('proposed_email', user.email)
    .in('status', ['accepted', 'completed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!req) {
    return NextResponse.json({ error: 'Aucune demande acceptée trouvée.' }, { status: 404 });
  }

  // Créer le membre
  const { error: insertError } = await supabase.from('membres').insert({
    name: req.proposed_name,
    email: req.proposed_email,
    role: req.proposed_role ?? null,
    company: req.proposed_company ?? null,
    linkedin: req.proposed_linkedin ?? null,
    image_url: req.proposed_image_url ?? null,
    is_active: true,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Marquer la demande comme complétée
  await supabase
    .from('member_requests')
    .update({ status: 'completed' })
    .eq('id', req.id);

  return NextResponse.json({ success: true });
}
