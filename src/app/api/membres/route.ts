import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() ?? '';

  const supabase = createServerSupabase();

  let query = supabase
    .from('membres')
    .select('id, name, email, role, company, bio, image_url, linkedin, expertise, year_joined')
    .eq('is_active', true)
    .order('name');

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query.limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
