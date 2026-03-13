import { NextResponse } from 'next/server';
import { createAnonSupabase, createServerSupabase } from '@/lib/supabase-server';

export async function PUT(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const anon = createAnonSupabase();
  const { data: { user } } = await anon.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { name, role, company, linkedin, image_url, bio } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });

  const supabase = createServerSupabase();

  const { error } = await supabase
    .from('membres')
    .update({
      name: name.trim(),
      role: role?.trim() || null,
      company: company?.trim() || null,
      linkedin: linkedin?.trim() || null,
      image_url: image_url?.trim() || null,
      bio: bio?.trim() || null,
    })
    .eq('email', user.email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
