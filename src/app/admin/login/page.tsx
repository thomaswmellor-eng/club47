'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="font-serif text-3xl font-bold text-white tracking-widest">
            CLUB <span className="text-gold-500">47</span>
          </span>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Espace Admin</p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
              placeholder="admin@club47.fr"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="text-red-400 text-sm text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-gold-500 text-black font-bold py-3 text-sm tracking-widest hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {pending ? 'CONNEXION...' : 'SE CONNECTER'}
          </button>
        </form>
      </div>
    </div>
  );
}
