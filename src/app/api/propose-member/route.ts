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

  // Bloquer si le membre existe déjà dans la table membres
  const { data: existing } = await supabase
    .from('membres')
    .select('id')
    .eq('email', proposed_email.toLowerCase().trim())
    .eq('is_active', true)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'Cette personne est déjà membre du Club 47.' },
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
