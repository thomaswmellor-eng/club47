'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarPlus, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Stratégie & Innovation',
  'Innovation & Tech',
  'Networking & Innovation',
  'Média & Innovation',
  'Stratégie & Leadership',
  'Luxe & Trends',
];

export default function NewEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    date: '',
    event_date: '',
    location: '',
    description: '',
    image_url: '',
    category: CATEGORIES[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la création');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/admin'), 1500);
    } catch {
      setError('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-charcoal pt-24 md:pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
            <CalendarPlus size={28} className="text-gold-500" />
          </div>
          <h2 className="text-white font-serif text-2xl mb-2">Événement créé !</h2>
          <p className="text-gray-500 text-sm">Redirection vers le tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal pt-24 md:pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-6">

        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>

        <h1 className="font-serif text-3xl text-white mb-1">Créer un événement</h1>
        <p className="text-gray-500 text-sm mb-10">Les champs marqués * sont obligatoires</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Titre *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Ex: Soirée IA & Marketing"
              className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Date affichée * <span className="text-gray-600 normal-case font-normal">(texte libre)</span>
              </label>
              <input
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                placeholder="Ex: 15 Septembre 2026, 18h30"
                className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Date de l&apos;événement * <span className="text-gray-600 normal-case font-normal">(pour tri automatique)</span>
              </label>
              <input
                name="event_date"
                type="date"
                value={form.event_date}
                onChange={handleChange}
                required
                className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Lieu *
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="Ex: PUBLICIS, 146 Rue de Courcelles"
              className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Catégorie *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Description de l'événement..."
              className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              URL de l&apos;image <span className="text-gray-600 normal-case font-normal">(optionnel)</span>
            </label>
            <input
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gold-500 text-black font-bold text-sm hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <CalendarPlus size={16} />
                  CRÉER L&apos;ÉVÉNEMENT
                </>
              )}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 border border-white/20 text-white font-bold text-sm hover:border-gold-500 hover:text-gold-500 transition-all duration-300 flex items-center justify-center"
            >
              ANNULER
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
