'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-client';

export default function AccountLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
      return;
    }

    router.push('/account');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-white mb-2">Espace Membre</h1>
          <div className="h-0.5 w-12 bg-gold-500 mx-auto" />
        </div>

        <div className="bg-neutral-900 border border-white/5 p-8">
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 pr-12 text-white placeholder-gray-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold-500 text-black font-bold text-sm hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Connexion...</> : 'SE CONNECTER'}
            </button>

          </form>

          <div className="mt-6 pt-5 border-t border-white/5 flex flex-col items-center gap-4">
            <Link
              href="/account/forgot-password"
              className="text-xs text-gray-500 hover:text-gold-500 transition-colors uppercase tracking-widest"
            >
              Mot de passe oublié ?
            </Link>
            <div className="w-full border-t border-white/5 pt-4 text-center">
              <p className="text-xs text-gray-600 mb-2">Pas encore membre ?</p>
              <Link
                href="/account/become-member"
                className="text-xs text-gold-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
              >
                Je veux devenir membre →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
