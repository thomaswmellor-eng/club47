import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import RequestsClient from './RequestsClient';

export default async function RequestsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  try {
    await verifyAdminToken(token);
  } catch {
    redirect('/admin/login');
  }

  const supabase = createServerSupabase();
  const { data: requests } = await supabase
    .from('member_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return <RequestsClient requests={requests ?? []} />;
}
