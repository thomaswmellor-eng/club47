'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

type Status = 'loading' | 'form' | 'submitting' | 'success' | 'error';

export default function CompleteSetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const at = params.get('access_token');
    const rt = params.get('refresh_token');

    if (!at || !rt) {
      setErrorMsg('Lien invalide ou expiré. Contactez un administrateur.');
      setStatus('error');
      return;
    }

    const supabase = createBrowserSupabase();
    supabase.auth.setSession({ access_token: at, refresh_token: rt }).then(({ error }) => {
      if (error) {
        setErrorMsg('Lien invalide ou expiré. Contactez un administrateur.');
        setStatus('error');
      } else {
        setAccessToken(at);
        setRefreshToken(rt);
        setStatus('form');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setErrorMsg('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    setErrorMsg('');
    setStatus('submitting');

    try {
      const supabase = createBrowserSupabase();

      // 1. Établir la session avec les tokens de l'invitation
      const { data: { user }, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError || !user) throw sessionError ?? new Error('Session invalide.');

      // 2. Définir le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // 3. Créer l'entrée membre via notre API
      const res = await fetch('/api/auth/complete-member-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: user.email, auth_id: user.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Erreur lors de la création du profil.');
      }

      setStatus('success');
      setTimeout(() => router.push('/members'), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setStatus('form');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-gold-500 text-2xl">✓</span>
          </div>
          <h1 className="font-serif text-3xl text-white mb-2">
            Bienvenue au <span className="text-gold-500">Club 47</span>
          </h1>
          <p className="text-gray-400 text-sm">Votre profil a été créé. Redirection en cours...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-red-400 text-2xl">✕</span>
          </div>
          <h1 className="font-serif text-2xl text-white mb-3">Lien invalide</h1>
          <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gold-500 text-black font-bold text-sm tracking-widest hover:bg-white transition-colors"
          >
            RETOUR À L&apos;ACCUEIL
          </button>
        </div>
      </div>
    );
  }

  // status === 'form' | 'submitting'
  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl text-white mb-2">
            Créez votre <span className="text-gold-500">mot de passe</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Choisissez un mot de passe sécurisé pour accéder à votre espace membre.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-white/10 p-8 space-y-5">

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
              Mot de passe <span className="text-gold-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                required
                className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-gold-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
              Confirmer le mot de passe <span className="text-gold-500">*</span>
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Répétez votre mot de passe"
              required
              className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {errorMsg && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-3 bg-gold-500 text-black font-bold text-sm tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'submitting' ? (
              <><Loader2 size={16} className="animate-spin" /> CRÉATION EN COURS...</>
            ) : (
              'CONFIRMER MON MOT DE PASSE'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
