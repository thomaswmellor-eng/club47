import { NextResponse } from 'next/server';
import { createAnonSupabase, createServerSupabase } from '@/lib/supabase-server';

export async function DELETE(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const anon = createAnonSupabase();
  const { data: { user } } = await anon.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { event_id } = await request.json();
  if (!event_id) return NextResponse.json({ error: 'event_id requis' }, { status: 400 });

  const supabase = createServerSupabase();

  const { data: membre } = await supabase
    .from('membres')
    .select('id')
    .eq('email', user.email)
    .single();

  if (!membre) return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });

  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('membre_id', membre.id)
    .eq('event_id', event_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
