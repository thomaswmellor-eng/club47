'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, User, Mail, Ban, Loader2, X, Send, Star } from 'lucide-react';

interface Membre {
  id: string;
  name: string;
  email: string;
  role?: string;
  company?: string;
  image_url?: string;
  is_featured: boolean;
  created_at: string;
}

interface Props {
  membres: Membre[];
  adminToken?: string;
}

export default function MembresClient({ membres: initial, adminToken }: Props) {
  const [membres, setMembres] = useState<Membre[]>(initial);
  const [search, setSearch] = useState('');

  // Contact modal
  const [contactTarget, setContactTarget] = useState<Membre | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Ban
  const [confirmBan, setConfirmBan] = useState<Membre | null>(null);
  const [banning, setBanning] = useState<string | null>(null);

  // Feature
  const [featuring, setFeaturing] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return membres;
    return membres.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.role ?? '').toLowerCase().includes(q) ||
        (m.company ?? '').toLowerCase().includes(q)
    );
  }, [membres, search]);

  const openContact = (m: Membre) => {
    setContactTarget(m);
    setSubject('');
    setMessage('');
    setContactSuccess(false);
  };

  const handleContact = async () => {
    if (!contactTarget || !subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await fetch('/api/admin/membres/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contactTarget.email, name: contactTarget.name, subject, message }),
      });
      setContactSuccess(true);
    } finally {
      setSending(false);
    }
  };

  const handleFeature = async (membre: Membre) => {
    setFeaturing(membre.id);
    try {
      const res = await fetch('/api/admin/membres/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: membre.id, is_featured: !membre.is_featured }),
      });
      if (res.ok) {
        setMembres((prev) => prev.map((m) => m.id === membre.id ? { ...m, is_featured: !m.is_featured } : m));
      }
    } finally {
      setFeaturing(null);
    }
  };

  const handleBan = async (membre: Membre) => {
    setBanning(membre.id);
    try {
      const res = await fetch('/api/admin/membres/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: membre.email }),
      });
      if (res.ok) {
        setMembres((prev) => prev.filter((m) => m.id !== membre.id));
      }
    } finally {
      setBanning(null);
      setConfirmBan(null);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal pt-24 md:pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-serif text-3xl text-white">Membres</h1>
            <p className="text-gray-500 text-sm">{membres.length} membre{membres.length > 1 ? 's' : ''} au total</p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, rôle, entreprise..."
            className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none pl-10 pr-4 py-3 text-white placeholder-gray-600 transition-colors"
          />
        </div>

        {/* Liste */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-12">Aucun membre trouvé.</p>
          )}
          {filtered.map((m) => (
            <div key={m.id} className="bg-neutral-900 border border-white/5 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gold-500/20 flex-shrink-0 bg-white/5 flex items-center justify-center">
                {m.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-gray-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{m.name}</p>
                <p className="text-gray-500 text-xs truncate">{m.email}</p>
                {(m.role || m.company) && (
                  <p className="text-gold-500/70 text-xs truncate">
                    {[m.role, m.company].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleFeature(m)}
                  disabled={featuring === m.id}
                  title={m.is_featured ? 'Retirer du Focus' : 'Mettre en Focus'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all text-xs ${
                    m.is_featured
                      ? 'border-gold-500 text-gold-400 bg-gold-500/10'
                      : 'border-white/10 text-gray-500 hover:border-gold-500/50 hover:text-gold-500/70'
                  }`}
                >
                  {featuring === m.id ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} className={m.is_featured ? 'fill-gold-400' : ''} />}
                  Focus
                </button>

                <button
                  onClick={() => openContact(m)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-gray-400 hover:border-gold-500 hover:text-gold-400 transition-all text-xs"
                >
                  <Mail size={12} />
                  Contacter
                </button>

                {confirmBan?.id === m.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleBan(m)}
                      disabled={banning === m.id}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {banning === m.id ? <Loader2 size={12} className="animate-spin" /> : 'Confirmer'}
                    </button>
                    <button
                      onClick={() => setConfirmBan(null)}
                      className="p-1.5 border border-white/10 text-gray-500 hover:text-white transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmBan(m)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-gray-500 hover:border-red-500/50 hover:text-red-400 transition-all text-xs"
                  >
                    <Ban size={12} />
                    Bannir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Contact */}
      {contactTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-white/10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-bold">Contacter</h2>
                <p className="text-gold-500 text-sm">{contactTarget.name}</p>
              </div>
              <button onClick={() => setContactTarget(null)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {contactSuccess ? (
              <div className="text-center py-8">
                <p className="text-green-400 font-semibold">Email envoyé avec succès !</p>
                <button
                  onClick={() => setContactTarget(null)}
                  className="mt-4 text-sm text-gray-500 hover:text-white transition-colors underline"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Objet</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Objet du message"
                    className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-2.5 text-white placeholder-gray-600 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Votre message..."
                    className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-2.5 text-white placeholder-gray-600 transition-colors text-sm resize-none"
                  />
                </div>
                <button
                  onClick={handleContact}
                  disabled={sending || !subject.trim() || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gold-500 text-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
