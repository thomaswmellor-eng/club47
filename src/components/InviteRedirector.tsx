'use client';

import { useEffect } from 'react';

// Détecte les tokens d'invitation Supabase dans le hash de n'importe quelle page
// et redirige vers /auth/complete-setup en préservant le hash
export default function InviteRedirector() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token=')) {
      if (hash.includes('type=invite')) {
        window.location.replace('/auth/complete-setup' + hash);
      } else if (hash.includes('type=recovery')) {
        window.location.replace('/account/reset-password' + hash);
      }
    }
  }, []);

  return null;
}
