import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    await verifyAdminToken(token);
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const { title, date, event_date, location, description, image_url, category } = body;

  if (!title || !date || !event_date || !location || !description || !category) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.from('events').insert({
    title,
    date,
    event_date,
    location,
    description,
    image_url: image_url || null,
    category,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
