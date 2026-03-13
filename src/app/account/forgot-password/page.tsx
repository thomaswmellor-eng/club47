'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch('/api/account/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });

    // Toujours afficher le message de succès (sécurité : pas d'énumération)
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-gold-500" />
          </div>
          <h2 className="font-serif text-2xl text-white mb-4">Vérifiez votre boîte mail</h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            Si votre adresse e-mail est liée à un compte membre, vous recevrez
            un e-mail contenant un lien de réinitialisation de mot de passe.
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
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">

        <div className="mb-8">
          <Link
            href="/account/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <ArrowLeft size={14} />
            Retour
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-white mb-2">Mot de passe oublié</h1>
          <div className="h-0.5 w-12 bg-gold-500 mx-auto" />
        </div>

        <div className="bg-neutral-900 border border-white/5 p-8">
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Entrez votre adresse e-mail. Si elle est liée à un compte membre,
            vous recevrez un lien pour réinitialiser votre mot de passe.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="votre@email.com"
                className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold-500 text-black font-bold text-sm hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Envoi...</> : 'ENVOYER LE LIEN'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
