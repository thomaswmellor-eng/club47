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

  const { id, is_featured } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from('membres')
    .update({ is_featured })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
