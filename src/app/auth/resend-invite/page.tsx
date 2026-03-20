'use client';

import { useState } from 'react';
import { Mail, Loader2, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResendInvitePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    await fetch('/api/auth/resend-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setStatus('done'); // toujours afficher succès (sécurité)
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <div className="mb-8">
          <h1 className="font-serif text-3xl text-white mb-2">
            Nouveau <span className="text-gold-500">lien</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Entrez votre adresse e-mail pour recevoir un nouveau lien de création de mot de passe.
          </p>
        </div>

        {status === 'done' ? (
          <div className="bg-neutral-900 border border-white/5 p-8 text-center">
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check size={22} className="text-green-400" />
            </div>
            <p className="text-white font-semibold mb-2">E-mail envoyé</p>
            <p className="text-gray-500 text-sm">
              Si votre adresse est bien associée à une invitation acceptée, vous recevrez un nouveau lien dans quelques instants.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-neutral-900 border border-white/5 p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="votre@email.com"
                  className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none pl-11 pr-4 py-3 text-white placeholder-gray-600 transition-colors text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gold-500 text-black font-bold text-sm uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
              Recevoir un nouveau lien
            </button>
          </form>
        )}

        <Link
          href="/account/login"
          className="flex items-center gap-2 text-gray-600 hover:text-white transition-colors text-xs mt-6"
        >
          <ArrowLeft size={13} />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
