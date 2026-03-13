'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronRight, Check, Loader2, UserPlus } from 'lucide-react';

interface MembreResult {
  id: string;
  name: string;
  email: string;
  role?: string;
  company?: string;
}

interface ProposerInfo {
  membre_id?: string;
  name: string;
  email: string;
  role: string;
  company: string;
}

interface ProposedInfo {
  name: string;
  email: string;
  role: string;
  company: string;
  bio: string;
  linkedin: string;
  image_url: string;
}

type Step = 1 | 2 | 3;

interface Props {
  onClose: () => void;
}

const EMPTY_PROPOSER: ProposerInfo = { name: '', email: '', role: '', company: '' };
const EMPTY_PROPOSED: ProposedInfo = {
  name: '', email: '', role: '', company: '', bio: '', linkedin: '', image_url: '',
};

export default function ProposeMemberModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<MembreResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [notInList, setNotInList] = useState(false);
  const [proposer, setProposer] = useState<ProposerInfo>(EMPTY_PROPOSER);
  const [proposed, setProposed] = useState<ProposedInfo>(EMPTY_PROPOSED);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  // Fermer avec Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Debounce search
  useEffect(() => {
    if (notInList || search.length < 2) {
      setResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/membres?search=${encodeURIComponent(search)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [search, notInList]);

  const selectMembre = (m: MembreResult) => {
    setProposer({
      membre_id: m.id,
      name: m.name,
      email: m.email,
      role: m.role ?? '',
      company: m.company ?? '',
    });
    setSearch(m.name);
    setResults([]);
  };

  const canProceedStep1 = proposer.name.trim() && proposer.email.trim();
  const canProceedStep2 = proposed.name.trim() && proposed.email.trim();

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/propose-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposer_membre_id: proposer.membre_id,
          proposer_name: proposer.name,
          proposer_email: proposer.email,
          proposer_role: proposer.role,
          proposer_company: proposer.company,
          proposed_name: proposed.name,
          proposed_email: proposed.email,
          proposed_role: proposed.role,
          proposed_company: proposed.company,
          proposed_bio: proposed.bio,
          proposed_linkedin: proposed.linkedin,
          proposed_image_url: proposed.image_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue.');
        return;
      }
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-neutral-900 border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <p className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-1">
              {step === 1 ? 'Étape 1 / 2' : step === 2 ? 'Étape 2 / 2' : 'Confirmation'}
            </p>
            <h2 className="font-serif text-xl text-white">
              {step === 1 && 'Qui proposez-vous ?'}
              {step === 2 && 'Le membre proposé'}
              {step === 3 && 'Demande envoyée'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-gray-400 text-sm">
                Commencez par nous identifier — cherchez votre nom dans la liste des membres.
              </p>

              {!notInList ? (
                <>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Recherchez votre nom..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setProposer(EMPTY_PROPOSER);
                      }}
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                    />
                    {searching && (
                      <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" />
                    )}
                  </div>

                  {results.length > 0 && (
                    <div className="border border-white/10 bg-black/40 divide-y divide-white/5">
                      {results.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => selectMembre(m)}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                        >
                          <p className="text-white text-sm font-medium">{m.name}</p>
                          <p className="text-gray-500 text-xs">{m.role}{m.company ? ` · ${m.company}` : ''}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {proposer.membre_id && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-gold-500/10 border border-gold-500/30">
                      <Check size={16} className="text-gold-500 flex-shrink-0" />
                      <p className="text-gold-300 text-sm">{proposer.name} sélectionné(e)</p>
                    </div>
                  )}

                  <button
                    onClick={() => { setNotInList(true); setProposer(EMPTY_PROPOSER); setSearch(''); }}
                    className="text-gray-500 text-xs hover:text-gold-500 transition-colors underline underline-offset-2"
                  >
                    Je ne suis pas dans cette liste
                  </button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Field
                        label="Votre nom *" value={proposer.name}
                        onChange={(v) => setProposer((p) => ({ ...p, name: v }))}
                        placeholder="Prénom Nom"
                      />
                    </div>
                    <div className="col-span-2">
                      <Field
                        label="Votre e-mail *" type="email" value={proposer.email}
                        onChange={(v) => setProposer((p) => ({ ...p, email: v }))}
                        placeholder="vous@exemple.com"
                      />
                    </div>
                    <Field
                      label="Votre poste" value={proposer.role}
                      onChange={(v) => setProposer((p) => ({ ...p, role: v }))}
                      placeholder="CEO, Directeur..."
                    />
                    <Field
                      label="Votre entreprise" value={proposer.company}
                      onChange={(v) => setProposer((p) => ({ ...p, company: v }))}
                      placeholder="Entreprise"
                    />
                  </div>
                  <button
                    onClick={() => setNotInList(false)}
                    className="text-gray-500 text-xs hover:text-gold-500 transition-colors underline underline-offset-2"
                  >
                    ← Rechercher dans la liste
                  </button>
                </>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full py-3 bg-gold-500 text-black font-bold text-sm tracking-widest hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                SUIVANT <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-gray-400 text-sm">
                Renseignez les informations du membre que vous souhaitez proposer.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field
                    label="Nom complet *" value={proposed.name}
                    onChange={(v) => setProposed((p) => ({ ...p, name: v }))}
                    placeholder="Prénom Nom"
                  />
                </div>
                <div className="col-span-2">
                  <Field
                    label="E-mail *" type="email" value={proposed.email}
                    onChange={(v) => setProposed((p) => ({ ...p, email: v }))}
                    placeholder="membre@exemple.com"
                  />
                </div>
                <Field
                  label="Poste" value={proposed.role}
                  onChange={(v) => setProposed((p) => ({ ...p, role: v }))}
                  placeholder="CEO, Directeur..."
                />
                <Field
                  label="Entreprise" value={proposed.company}
                  onChange={(v) => setProposed((p) => ({ ...p, company: v }))}
                  placeholder="Entreprise"
                />
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Biographie</label>
                  <textarea
                    value={proposed.bio}
                    onChange={(e) => setProposed((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Quelques mots sur ce membre..."
                    rows={3}
                    className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none"
                  />
                </div>
                <div className="col-span-2">
                  <Field
                    label="LinkedIn URL" value={proposed.linkedin}
                    onChange={(v) => setProposed((p) => ({ ...p, linkedin: v }))}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="col-span-2">
                  <Field
                    label="Photo de profil (URL)"
                    value={proposed.image_url}
                    onChange={(v) => setProposed((p) => ({ ...p, image_url: v }))}
                    placeholder="https://... (lien direct vers une image)"
                  />
                  <p className="text-gray-600 text-xs mt-1">
                    Collez un lien direct vers une photo (GitHub, site perso...). Les photos LinkedIn ne sont pas récupérables automatiquement.
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-white/20 text-white font-bold text-sm hover:border-white transition-colors"
                >
                  RETOUR
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canProceedStep2 || submitting}
                  className="flex-1 py-3 bg-gold-500 text-black font-bold text-sm tracking-widest hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> ENVOI...</>
                  ) : (
                    <><UserPlus size={16} /> J&apos;AI FINI</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto">
                <Check size={28} className="text-gold-500" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-white mb-2">Demande envoyée !</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                  Votre proposition pour <strong className="text-white">{proposed.name}</strong> a
                  été transmise aux administrateurs. Vous serez informé(e) de la décision.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-10 py-3 bg-gold-500 text-black font-bold text-sm tracking-widest hover:bg-white transition-colors"
              >
                FERMER
              </button>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}

// Petit composant champ réutilisable interne
function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors"
      />
    </div>
  );
}
