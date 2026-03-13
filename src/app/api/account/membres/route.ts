import { NextResponse } from 'next/server';
import { createAnonSupabase, createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const anon = createAnonSupabase();
  const { data: { user } } = await anon.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const supabase = createServerSupabase();

  const { data } = await supabase
    .from('membres')
    .select('id, name, role, company, image_url, linkedin')
    .order('name', { ascending: true });

  return NextResponse.json(data ?? []);
}
