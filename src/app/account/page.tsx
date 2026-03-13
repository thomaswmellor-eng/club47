'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, User, Calendar, MapPin, X, Users, Search, Linkedin, Building2, Briefcase, Pencil, Check, Save } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-client';
import ProfileCompletionModal from '@/components/ProfileCompletionModal';

interface Membre {
  name: string;
  role?: string;
  company?: string;
  image_url?: string;
  linkedin?: string;
  bio?: string;
}

interface Registration {
  event_id: string;
  created_at: string;
  events?: {
    id: string;
    title: string;
    date: string;
    location: string;
    category: string;
  };
}

interface NetworkMembre {
  id: string;
  name: string;
  role?: string;
  company?: string;
  image_url?: string;
  linkedin?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [membre, setMembre] = useState<Membre | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [confirmUnregister, setConfirmUnregister] = useState<string | null>(null);
  const [unregisteringId, setUnregisteringId] = useState<string | null>(null);

  // Profile completion
  const [missingFields, setMissingFields] = useState<{ key: 'role' | 'company' | 'linkedin' | 'image_url' | 'bio'; label: string; placeholder: string; type: 'text' | 'url' | 'textarea' }[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'compte' | 'profil' | 'networking'>('compte');

  // Edit profile
  const [editForm, setEditForm] = useState({ name: '', role: '', company: '', linkedin: '', image_url: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Networking
  const [networkMembres, setNetworkMembres] = useState<NetworkMembre[]>([]);
  const [networkLoaded, setNetworkLoaded] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  useEffect(() => {
    const supabase = createBrowserSupabase();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/account/login'); return; }

      setAccessToken(session.access_token);

      const { data } = await supabase
        .from('membres')
        .select('name, role, company, image_url, linkedin, bio')
        .eq('email', session.user.email)
        .maybeSingle();

      setMembre(data);
      if (data) {
        setEditForm({
          name: data.name ?? '',
          role: data.role ?? '',
          company: data.company ?? '',
          linkedin: data.linkedin ?? '',
          image_url: data.image_url ?? '',
          bio: data.bio ?? '',
        });

        // Détecter les champs manquants dynamiquement
        const FIELD_DEFS = [
          { key: 'role' as const,      label: 'Quel est votre poste ?',       placeholder: 'ex : Directrice Marketing',                             type: 'text' as const },
          { key: 'company' as const,   label: 'Dans quelle entreprise ?',     placeholder: 'ex : Groupe Bel',                                       type: 'text' as const },
          { key: 'bio' as const,       label: 'Parlez-nous de vous',          placeholder: 'Quelques mots sur votre parcours, vos projets...',      type: 'textarea' as const },
          { key: 'linkedin' as const,  label: 'Votre profil LinkedIn ?',      placeholder: 'linkedin.com/in/votre-profil',                          type: 'text' as const },
          { key: 'image_url' as const, label: 'Une photo de profil ?',        placeholder: 'https://media.licdn.com/...',                           type: 'url' as const },
        ];
        const missing = FIELD_DEFS.filter((f) => !data[f.key]);
        if (missing.length > 0) {
          setMissingFields(missing);
          setShowCompletion(true);
        }
      }

      const regs = await fetch('/api/account/registrations', {
        headers: { Authorization: 'Bearer ' + session.access_token },
      }).then((r) => r.json());

      if (Array.isArray(regs)) setRegistrations(regs);
      setLoading(false);
    });
  }, [router]);

  const loadNetworking = async () => {
    if (networkLoaded || !accessToken) return;
    const data = await fetch('/api/account/membres', {
      headers: { Authorization: 'Bearer ' + accessToken },
    }).then((r) => r.json());
    if (Array.isArray(data)) setNetworkMembres(data);
    setNetworkLoaded(true);
  };

  const handleTabChange = (tab: 'compte' | 'profil' | 'networking') => {
    setActiveTab(tab);
    if (tab === 'networking') loadNetworking();
  };

  const handleSaveProfile = async () => {
    if (!accessToken || !editForm.name.trim()) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setMembre({
          name: editForm.name,
          role: editForm.role || undefined,
          company: editForm.company || undefined,
          linkedin: editForm.linkedin || undefined,
          image_url: editForm.image_url || undefined,
          bio: editForm.bio || undefined,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const d = await res.json();
        setSaveError(d.error ?? 'Erreur lors de la sauvegarde');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCompletionDone = (values: Record<string, string>) => {
    setMembre((prev) => prev ? { ...prev, ...values } : prev);
    setEditForm((prev) => ({ ...prev, ...values }));
    setShowCompletion(false);
  };

  const handleUnregister = async (eventId: string) => {
    if (!accessToken) return;
    setUnregisteringId(eventId);
    try {
      await fetch('/api/account/unregister-event', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
        body: JSON.stringify({ event_id: eventId }),
      });
      setRegistrations((prev) => prev.filter((r) => r.event_id !== eventId));
    } finally {
      setUnregisteringId(null);
      setConfirmUnregister(null);
    }
  };

  const roleOptions = useMemo(
    () => Array.from(new Set(networkMembres.map((m) => m.role).filter(Boolean))).sort() as string[],
    [networkMembres]
  );
  const companyOptions = useMemo(
    () => Array.from(new Set(networkMembres.map((m) => m.company).filter(Boolean))).sort() as string[],
    [networkMembres]
  );
  const filteredMembres = useMemo(() => {
    return networkMembres.filter((m) => {
      const matchName = !searchName || m.name.toLowerCase().includes(searchName.toLowerCase());
      const matchRole = !filterRole || m.role === filterRole;
      const matchCompany = !filterCompany || m.company === filterCompany;
      return matchName && matchRole && matchCompany;
    });
  }, [networkMembres, searchName, filterRole, filterCompany]);

  const hasFilters = searchName || filterRole || filterCompany;

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <Loader2 size={32} className="text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-charcoal">

      {/* Hero header */}
      <div className="border-b border-white/5 pt-24 md:pt-32 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold-500/40 flex-shrink-0 bg-white/5 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                {membre?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={membre.image_url} alt={membre.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Espace membre</p>
                <h1 className="font-serif text-2xl md:text-3xl text-white leading-tight">
                  {membre?.name ?? 'Membre'}
                </h1>
                {membre?.role && (
                  <p className="text-gold-500 text-sm mt-0.5">{membre.role}{membre.company ? ` · ${membre.company}` : ''}</p>
                )}
              </div>
            </div>
            <button
              onClick={async () => {
                const supabase = createBrowserSupabase();
                await supabase.auth.signOut();
                router.push('/');
                router.refresh();
              }}
              className="flex items-center gap-2 px-4 py-2 border border-white/10 text-gray-400 hover:border-red-500/50 hover:text-red-400 transition-all duration-200 text-xs font-bold uppercase tracking-wider"
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Déconnexion</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-8 flex-wrap">
            <button
              onClick={() => handleTabChange('compte')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'compte' ? 'bg-gold-500 text-black' : 'text-gray-500 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              <Calendar size={13} />
              Mes événements
            </button>
            <button
              onClick={() => handleTabChange('profil')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'profil' ? 'bg-gold-500 text-black' : 'text-gray-500 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              <Pencil size={13} />
              Mon profil
            </button>
            <button
              onClick={() => handleTabChange('networking')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'networking' ? 'bg-gold-500 text-black' : 'text-gray-500 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              <Users size={13} />
              Networking
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* ── Tab: Mes événements ── */}
        {activeTab === 'compte' && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">
              Mes événements ({registrations.length})
            </h2>
            {registrations.length === 0 ? (
              <div className="border border-dashed border-white/10 p-10 text-center">
                <Calendar size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Vous n&apos;êtes inscrit à aucun événement pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => (
                  <div key={reg.event_id} className="bg-neutral-900 border border-white/5 hover:border-white/10 p-5 flex items-center justify-between gap-4 transition-colors">
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm mb-2">{reg.events?.title}</p>
                      <div className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Calendar size={11} className="text-gold-500/60" />
                          {reg.events?.date}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <MapPin size={11} className="text-gold-500/60" />
                          {reg.events?.location}
                        </span>
                        {reg.events?.category && (
                          <span className="text-gold-500/60 text-xs border border-gold-500/20 px-2 py-0.5">
                            {reg.events.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {confirmUnregister === reg.event_id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 hidden sm:block">Se désinscrire ?</span>
                          <button
                            onClick={() => handleUnregister(reg.event_id)}
                            disabled={unregisteringId === reg.event_id}
                            className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            {unregisteringId === reg.event_id ? <Loader2 size={12} className="animate-spin" /> : 'Confirmer'}
                          </button>
                          <button onClick={() => setConfirmUnregister(null)} className="p-1.5 border border-white/10 text-gray-500 hover:text-white transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmUnregister(reg.event_id)} className="text-xs text-gray-600 hover:text-red-400 transition-colors underline underline-offset-2">
                          Se désinscrire
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Mon profil ── */}
        {activeTab === 'profil' && (
          <div className="max-w-lg">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
              Modifier mes informations
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Nom complet <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors text-sm"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Poste / Rôle
                </label>
                <input
                  type="text"
                  value={editForm.role}
                  onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors text-sm"
                  placeholder="ex : Directeur Marketing"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) => setEditForm((p) => ({ ...p, company: e.target.value }))}
                  className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors text-sm"
                  placeholder="ex : Groupe LVMH"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={editForm.linkedin}
                  onChange={(e) => setEditForm((p) => ({ ...p, linkedin: e.target.value }))}
                  className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors text-sm"
                  placeholder="linkedin.com/in/votre-profil"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Bio <span className="text-gray-600 normal-case font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors text-sm resize-none"
                  placeholder="Quelques mots sur vous, votre parcours, vos centres d'intérêt..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  URL de votre photo <span className="text-gray-600 normal-case font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={editForm.image_url}
                  onChange={(e) => setEditForm((p) => ({ ...p, image_url: e.target.value }))}
                  className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors text-sm"
                  placeholder="https://media.licdn.com/..."
                />
                {editForm.image_url && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gold-500/20 bg-white/5 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editForm.image_url} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <span className="text-gray-600 text-xs">Aperçu</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !editForm.name.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-green-400 text-sm">
                    <Check size={15} /> Profil mis à jour
                  </span>
                )}
                {saveError && <span className="text-red-400 text-sm">{saveError}</span>}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Networking ── */}
        {activeTab === 'networking' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Annuaire des membres</h2>
              <p className="text-gray-600 text-xs">Trouvez et connectez-vous avec les membres du Club 47.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Rechercher un nom..."
                  className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none pl-9 pr-4 py-2.5 text-white placeholder-gray-600 transition-colors text-sm"
                />
              </div>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none pl-9 pr-4 py-2.5 text-sm transition-colors appearance-none cursor-pointer"
                  style={{ color: filterRole ? 'white' : '#4b5563' }}
                >
                  <option value="">Tous les rôles</option>
                  {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <select
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none pl-9 pr-4 py-2.5 text-sm transition-colors appearance-none cursor-pointer"
                  style={{ color: filterCompany ? 'white' : '#4b5563' }}
                >
                  <option value="">Toutes les entreprises</option>
                  {companyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {hasFilters && (
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xs text-gray-500">{filteredMembres.length} résultat{filteredMembres.length > 1 ? 's' : ''}</span>
                <button onClick={() => { setSearchName(''); setFilterRole(''); setFilterCompany(''); }} className="flex items-center gap-1 text-xs text-gray-600 hover:text-white transition-colors">
                  <X size={12} /> Réinitialiser
                </button>
              </div>
            )}

            {!networkLoaded && <div className="flex justify-center py-16"><Loader2 size={24} className="text-gold-500 animate-spin" /></div>}

            {networkLoaded && (
              filteredMembres.length === 0 ? (
                <div className="border border-dashed border-white/10 p-10 text-center">
                  <Users size={32} className="text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucun membre ne correspond à votre recherche.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMembres.map((m) => (
                    <div key={m.id} className="bg-neutral-900 border border-white/5 hover:border-gold-500/30 p-5 transition-all duration-300 group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gold-500/20 flex-shrink-0 bg-white/5 flex items-center justify-center">
                          {m.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} className="text-gray-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate group-hover:text-gold-300 transition-colors">{m.name}</p>
                          {m.role && <p className="text-gold-500/70 text-xs truncate">{m.role}</p>}
                        </div>
                      </div>
                      {m.company && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
                          <Building2 size={11} />
                          <span className="truncate">{m.company}</span>
                        </div>
                      )}
                      {m.linkedin && (
                        <a
                          href={m.linkedin.startsWith('http') ? m.linkedin : `https://${m.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#0A66C2] transition-colors mt-2"
                        >
                          <Linkedin size={12} />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>

    {/* Modal de complétion de profil */}
    {showCompletion && missingFields.length > 0 && accessToken && (
      <ProfileCompletionModal
        missingFields={missingFields}
        accessToken={accessToken}
        memberName={membre?.name ?? ''}
        existingValues={editForm}
        onComplete={handleCompletionDone}
        onSkip={() => setShowCompletion(false)}
      />
    )}
    </>
  );
}
