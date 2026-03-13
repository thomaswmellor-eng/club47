import { NextResponse } from 'next/server';
import { createAnonSupabase, createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const anon = createAnonSupabase();
  const { data: { user } } = await anon.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const supabase = createServerSupabase();

  const { data: membre } = await supabase
    .from('membres')
    .select('id')
    .eq('email', user.email)
    .single();

  if (!membre) return NextResponse.json([]);

  const { data } = await supabase
    .from('event_registrations')
    .select('event_id, created_at, events(id, title, date, location, category)')
    .eq('membre_id', membre.id);

  return NextResponse.json(data ?? []);
}
