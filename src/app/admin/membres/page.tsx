import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import MembresClient from './MembresClient';

export default async function AdminMembresPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  try {
    await verifyAdminToken(token);
  } catch {
    redirect('/admin/login');
  }

  const supabase = createServerSupabase();
  const { data: membres } = await supabase
    .from('membres')
    .select('id, name, email, role, company, image_url, is_featured, created_at')
    .order('created_at', { ascending: false });

  return <MembresClient membres={membres ?? []} />;
}
