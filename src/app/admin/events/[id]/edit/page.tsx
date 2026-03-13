import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import EditEventForm from './EditEventForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  try {
    await verifyAdminToken(token);
  } catch {
    redirect('/admin/login');
  }

  const { id } = await params;
  const supabase = createServerSupabase();
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (!event) notFound();

  return <EditEventForm event={event} />;
}
