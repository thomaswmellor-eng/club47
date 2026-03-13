import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyAdminToken } from '@/lib/auth';
import { CalendarPlus, Pencil, ArrowLeft } from 'lucide-react';

export default async function AdminEventsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  try {
    await verifyAdminToken(token);
  } catch {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-charcoal pt-24 md:pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">

        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>

        <h1 className="font-serif text-3xl text-white mb-1">Événements</h1>
        <p className="text-gray-500 text-sm mb-10">Gérer l&apos;agenda du club</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/events/new"
            className="group bg-neutral-900 border border-white/5 hover:border-gold-500 p-6 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gold-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="mb-4">
              <div className="p-3 bg-gold-500/10 border border-gold-500/20 inline-block">
                <CalendarPlus size={20} className="text-gold-500" />
              </div>
            </div>
            <h2 className="text-white font-bold text-sm uppercase tracking-wider group-hover:text-gold-300 transition-colors">
              Créer un événement
            </h2>
            <p className="text-gray-500 text-xs mt-1">Ajouter à l&apos;agenda du club</p>
          </Link>

          <Link
            href="/admin/events/edit"
            className="group bg-neutral-900 border border-white/5 hover:border-gold-500 p-6 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gold-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="mb-4">
              <div className="p-3 bg-gold-500/10 border border-gold-500/20 inline-block">
                <Pencil size={20} className="text-gold-500" />
              </div>
            </div>
            <h2 className="text-white font-bold text-sm uppercase tracking-wider group-hover:text-gold-300 transition-colors">
              Modifier un événement
            </h2>
            <p className="text-gray-500 text-xs mt-1">Éditer les événements existants</p>
          </Link>
        </div>

      </div>
    </div>
  );
}
