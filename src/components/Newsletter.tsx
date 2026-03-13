'use client';

import React, { useState } from 'react';
import { Send, Loader2, Check } from 'lucide-react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStatus('success');
      setEmail('');
    } else if (res.status === 409) {
      setStatus('already');
    } else {
      setStatus('error');
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-charcoal to-black relative">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">Restez connecté à l&apos;excellence</h2>
        <p className="text-gray-400 mb-10">
          Recevez les insights exclusifs de nos conférences et les actualités du Club 47.
          Pas de spam, uniquement de la valeur.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-3 text-green-400 font-semibold">
            <Check size={20} />
            Merci ! Vous êtes bien inscrit à la newsletter.
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                placeholder="Votre email professionnel"
                className="flex-1 bg-white/5 border border-white/10 px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-gold-500 text-black px-8 py-4 font-bold tracking-wide hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                S&apos;ABONNER
              </button>
            </form>
            {status === 'already' && (
              <p className="text-yellow-500/80 text-sm mt-3">Cette adresse est déjà inscrite.</p>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-sm mt-3">Une erreur est survenue, réessayez.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
