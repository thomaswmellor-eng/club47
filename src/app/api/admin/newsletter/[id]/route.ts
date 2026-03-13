import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  try { await verifyAdminToken(token); return true; } catch { return null; }
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from('newsletters').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id } = await params;
  const { title, subject, body } = await request.json();

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from('newsletters')
    .update({ title: title?.trim(), subject: subject?.trim(), body: body ?? '' })
    .eq('id', id)
    .eq('status', 'draft');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id } = await params;
  const supabase = createServerSupabase();
  const { error } = await supabase.from('newsletters').delete().eq('id', id).eq('status', 'draft');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
