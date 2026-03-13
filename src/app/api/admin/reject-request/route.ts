import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  let adminName: string;
  try {
    const payload = await verifyAdminToken(token);
    adminName = payload.name;
  } catch {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const { request_id, admin_notes } = await request.json();
  if (!request_id) return NextResponse.json({ error: 'request_id manquant.' }, { status: 400 });

  const supabase = createServerSupabase();

  const { error } = await supabase
    .from('member_requests')
    .update({
      status: 'rejected',
      reviewed_by_name: adminName,
      admin_notes: admin_notes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', request_id)
    .eq('status', 'pending');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
