import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  try {
    await verifyAdminToken(token);
    return true;
  } catch {
    return null;
  }
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('newsletters')
    .select('id, title, subject, status, sent_at, recipient_count, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { title, subject, body } = await request.json();
  if (!title?.trim() || !subject?.trim()) {
    return NextResponse.json({ error: 'Titre et sujet requis' }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('newsletters')
    .insert({ title: title.trim(), subject: subject.trim(), body: body ?? '' })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
