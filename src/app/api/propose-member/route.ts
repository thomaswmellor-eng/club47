import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const body = await request.json();

  const {
    proposer_membre_id,
    proposer_name,
    proposer_email,
    proposer_role,
    proposer_company,
    proposed_name,
    proposed_email,
    proposed_role,
    proposed_company,
    proposed_bio,
    proposed_linkedin,
    proposed_image_url,
    proposed_expertise,
  } = body;

  if (!proposer_name || !proposer_email || !proposed_name || !proposed_email) {
    return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
  }

  const supabase = createServerSupabase();

  // Vérifier qu'il n'y a pas déjà une demande en attente pour cet email
  const { data: existing } = await supabase
    .from('member_requests')
    .select('id')
    .eq('proposed_email', proposed_email)
    .in('status', ['pending', 'accepted'])
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Une demande est déjà en cours pour cet e-mail.' },
      { status: 409 }
    );
  }

  const { error } = await supabase.from('member_requests').insert({
    proposer_membre_id: proposer_membre_id || null,
    proposer_name,
    proposer_email,
    proposer_role,
    proposer_company,
    proposed_name,
    proposed_email,
    proposed_role,
    proposed_company,
    proposed_bio,
    proposed_linkedin,
    proposed_image_url,
    proposed_expertise: proposed_expertise?.length ? proposed_expertise : null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
