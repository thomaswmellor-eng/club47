'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Loader2, Check } from 'lucide-react';

const CATEGORIES = [
  'Stratégie & Innovation',
  'Innovation & Tech',
  'Networking & Innovation',
  'Média & Innovation',
  'Stratégie & Leadership',
  'Luxe & Trends',
];

interface Event {
  id: string;
  title: string;
  date: string;
  event_date: string;
  location: string;
  description: string;
  image_url?: string;
  category: string;
}

export default function EditEventForm({ event }: { event: Event }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: event.title,
    date: event.date,
    event_date: event.event_date,
    location: event.location,
    description: event.description,
    image_url: event.image_url ?? '',
    category: event.category,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la mise à jour');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/admin/events/edit'), 1500);
    } catch {
      setError('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal pt-24 md:pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-6">

        <div className="mb-8">
          <Link
            href="/admin/events/edit"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>

        <h1 className="font-serif text-3xl text-white mb-1">Modifier l&apos;événement</h1>
        <p className="text-gray-500 text-sm mb-10 truncate">{event.title}</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Titre *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
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
                Date ISO * <span className="text-gray-600 normal-case font-normal">(tri automatique)</span>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Lieu *</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Catégorie *</label>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
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
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3">{error}</p>
          )}

          {success && (
            <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 px-4 py-3 flex items-center gap-2">
              <Check size={16} /> Événement mis à jour avec succès
            </p>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gold-500 text-black font-bold text-sm hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Enregistrement...</>
              ) : (
                <><Pencil size={16} /> ENREGISTRER</>
              )}
            </button>
            <Link
              href="/admin/events/edit"
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
