import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { ArrowLeft } from 'lucide-react';
import EventsEditClient from './EventsEditClient';

export default async function EditEventsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  try {
    await verifyAdminToken(token);
  } catch {
    redirect('/admin/login');
  }

  const supabase = createServerSupabase();
  const { data: events } = await supabase
    .from('events')
    .select('id, title, date, event_date, location, category')
    .order('event_date', { ascending: false });

  return (
    <div className="min-h-screen bg-charcoal pt-24 md:pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">

        <div className="mb-8">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>

        <h1 className="font-serif text-3xl text-white mb-1">Gérer les événements</h1>
        <p className="text-gray-500 text-sm mb-10">Modifier ou supprimer un événement</p>

        <EventsEditClient events={events ?? []} />

      </div>
    </div>
  );
}
