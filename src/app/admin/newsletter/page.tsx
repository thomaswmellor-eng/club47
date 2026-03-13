import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import NewsletterClient from './NewsletterClient';

export default async function AdminNewsletterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  try {
    await verifyAdminToken(token);
  } catch {
    redirect('/admin/login');
  }

  const supabase = createServerSupabase();
  const [{ data: newsletters }, { count: subscriberCount }] = await Promise.all([
    supabase
      .from('newsletters')
      .select('id, title, subject, status, sent_at, recipient_count, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true }),
  ]);

  return (
    <NewsletterClient
      initialNewsletters={newsletters ?? []}
      subscriberCount={subscriberCount ?? 0}
    />
  );
}
