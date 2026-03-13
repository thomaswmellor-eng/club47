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

  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 });

  const supabase = createServerSupabase();

  // Trouver le membre dans la table membres
  const { data: membre } = await supabase
    .from('membres')
    .select('id')
    .eq('email', email)
    .single();

  if (!membre) return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });

  // Trouver et supprimer l'utilisateur Supabase Auth par email
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const authUser = users.find((u) => u.email === email);
  if (authUser) {
    await supabase.auth.admin.deleteUser(authUser.id);
  }

  // Supprimer le membre (cascade sur event_registrations)
  await supabase.from('membres').delete().eq('id', membre.id);

  return NextResponse.json({ success: true });
}
