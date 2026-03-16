'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import ImageUrlHelpButton from '@/components/ImageUrlHelpButton';

export default function BecomeMemberPage() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    company: '',
    bio: '',
    linkedin: '',
    image_url: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/propose-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // La personne se propose elle-même
          proposer_name: form.name,
          proposer_email: form.email,
          proposer_role: form.role,
          proposer_company: form.company,
          proposed_name: form.name,
          proposed_email: form.email,
          proposed_role: form.role,
          proposed_company: form.company,
          proposed_bio: form.bio,
          proposed_linkedin: form.linkedin,
          proposed_image_url: form.image_url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          res.status === 409
            ? 'Une demande est déjà en cours pour cet e-mail.'
            : data.error ?? 'Une erreur est survenue.'
        );
        return;
      }

      setStep('success');
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-gold-500" />
          </div>
          <h2 className="font-serif text-2xl text-white mb-4">Demande envoyée</h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            Votre candidature a bien été transmise à l&apos;équipe du Club 47.
            Vous serez contacté(e) par e-mail si votre profil est retenu.
          </p>
          <Link
            href="/account/login"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gold-500 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal pt-20 pb-20">
      <div className="max-w-xl mx-auto px-6">

        <div className="mb-8 pt-8">
          <Link
            href="/account/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <ArrowLeft size={14} />
            Retour
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-white mb-2">Devenir membre</h1>
          <div className="h-0.5 w-12 bg-gold-500 mx-auto mb-4" />
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            Soumettez votre candidature. L&apos;équipe du Club 47 étudiera votre profil
            et vous contactera par e-mail.
          </p>
        </div>

        <div className="bg-neutral-900 border border-white/5 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Nom complet *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Jean Dupont"
                  className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  E-mail *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="jean@exemple.com"
                  className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Poste / Titre
                </label>
                <input
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="Directeur Marketing"
                  className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Entreprise
                </label>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Nom de l'entreprise"
                  className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                LinkedIn
              </label>
              <input
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                placeholder="linkedin.com/in/votre-profil"
                className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  URL de votre photo <span className="text-gray-600 normal-case font-normal">(optionnel)</span>
                </label>
                <ImageUrlHelpButton />
              </div>
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://media.licdn.com/... ou autre lien"
                className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Biographie / Motivation
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Parlez-nous de votre parcours et de vos motivations pour rejoindre le Club 47..."
                className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gold-500 text-black font-bold text-sm hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                : 'ENVOYER MA CANDIDATURE'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
