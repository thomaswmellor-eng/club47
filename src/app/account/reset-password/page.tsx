'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      setState('error');
      return;
    }

    const supabase = createBrowserSupabase();
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        setState(error ? 'error' : 'form');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setSubmitting(true);
    setError('');

    const supabase = createBrowserSupabase();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('Erreur lors de la mise à jour : ' + updateError.message);
      setSubmitting(false);
      return;
    }

    // Try to create the member record if it doesn't exist yet
    // (handles users who land on reset-password instead of complete-setup)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetch('/api/auth/complete-member-setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    }

    setState('success');
    setTimeout(() => router.push('/account'), 2000);
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <Loader2 size={32} className="text-gold-500 animate-spin" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">Lien invalide ou expiré.</p>
          <a href="/account/forgot-password" className="text-gold-500 hover:underline text-sm">
            Demander un nouveau lien
          </a>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-gold-500" />
          </div>
          <h2 className="font-serif text-2xl text-white mb-2">Mot de passe mis à jour</h2>
          <p className="text-gray-500 text-sm">Redirection vers votre espace membre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-white mb-2">Nouveau mot de passe</h1>
          <div className="h-0.5 w-12 bg-gold-500 mx-auto" />
        </div>

        <div className="bg-neutral-900 border border-white/5 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="8 caractères minimum"
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-black/30 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors"
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
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Mise à jour...</> : 'ENREGISTRER'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
