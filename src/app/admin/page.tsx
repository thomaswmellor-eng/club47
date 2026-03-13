import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyAdminToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { Users, Clock, Calendar, UserCog, Mail } from 'lucide-react';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  let name: string;
  try {
    const payload = await verifyAdminToken(token);
    name = payload.name;
  } catch {
    redirect('/admin/login');
  }

  const supabase = createServerSupabase();
  const { count: pendingCount } = await supabase
    .from('member_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  return (
    <div className="min-h-screen bg-charcoal pt-24 md:pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">

        <h1 className="font-serif text-4xl text-white mb-2">
          Salut <span className="text-gold-500">{name!}</span>
        </h1>
        <p className="text-gray-500 text-sm mb-12">Tableau de bord administrateur</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/requests"
            className="group bg-neutral-900 border border-white/5 hover:border-gold-500 p-6 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gold-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gold-500/10 border border-gold-500/20">
                <Users size={20} className="text-gold-500" />
              </div>
              {(pendingCount ?? 0) > 0 && (
                <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold bg-yellow-400/10 border border-yellow-400/20 px-2 py-1">
                  <Clock size={12} />
                  {pendingCount} en attente
                </span>
              )}
            </div>
            <h2 className="text-white font-bold text-sm uppercase tracking-wider group-hover:text-gold-300 transition-colors">
              Demandes de membres
            </h2>
            <p className="text-gray-500 text-xs mt-1">Gérer les propositions</p>
          </Link>
          <Link
            href="/admin/events"
            className="group bg-neutral-900 border border-white/5 hover:border-gold-500 p-6 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gold-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gold-500/10 border border-gold-500/20">
                <Calendar size={20} className="text-gold-500" />
              </div>
            </div>
            <h2 className="text-white font-bold text-sm uppercase tracking-wider group-hover:text-gold-300 transition-colors">
              Événements
            </h2>
            <p className="text-gray-500 text-xs mt-1">Créer et modifier l&apos;agenda</p>
          </Link>
          <Link
            href="/admin/membres"
            className="group bg-neutral-900 border border-white/5 hover:border-gold-500 p-6 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gold-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gold-500/10 border border-gold-500/20">
                <UserCog size={20} className="text-gold-500" />
              </div>
            </div>
            <h2 className="text-white font-bold text-sm uppercase tracking-wider group-hover:text-gold-300 transition-colors">
              Membres
            </h2>
            <p className="text-gray-500 text-xs mt-1">Rechercher, contacter, bannir</p>
          </Link>
          <Link
            href="/admin/newsletter"
            className="group bg-neutral-900 border border-white/5 hover:border-gold-500 p-6 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gold-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gold-500/10 border border-gold-500/20">
                <Mail size={20} className="text-gold-500" />
              </div>
            </div>
            <h2 className="text-white font-bold text-sm uppercase tracking-wider group-hover:text-gold-300 transition-colors">
              Newsletter
            </h2>
            <p className="text-gray-500 text-xs mt-1">Rédiger et envoyer des campagnes</p>
          </Link>
        </div>

      </div>
    </div>
  );
}
