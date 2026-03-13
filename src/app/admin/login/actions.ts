'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAnonSupabase, createServerSupabase } from '@/lib/supabase-server';
import { signAdminToken } from '@/lib/auth';

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Veuillez remplir tous les champs.' };
  }

  // 1. Authentification via Supabase Auth
  const anonClient = createAnonSupabase();
  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: 'Identifiants invalides.' };
  }

  // 2. Vérifier que l'utilisateur est bien dans la table admin
  const serverClient = createServerSupabase();
  const { data: adminData, error: adminError } = await serverClient
    .from('admin')
    .select('name')
    .eq('id', authData.user.id)
    .single();

  if (adminError || !adminData) {
    return { error: 'Accès non autorisé.' };
  }

  // 3. Créer le cookie de session JWT
  const token = await signAdminToken({ name: adminData.name, email });
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  redirect('/admin');
}
