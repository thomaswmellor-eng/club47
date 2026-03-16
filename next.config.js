/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Force HTTPS pour toutes les requêtes (1 an)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // Bloque le chargement de ressources non-HTTPS sur la page de login
  // Empêche un script injecté de voler le mot de passe via une requête HTTP
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline requis par Next.js
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://images.unsplash.com https://picsum.photos https://*.picsum.photos https://media.licdn.com https://ui-avatars.com",
      "connect-src 'self' https://*.supabase.co", // uniquement vers Supabase
      "frame-src https://customer-mdxgfcqxkyxecmm4.cloudflarestream.com", // vidéo tutoriel
      "frame-ancestors 'none'", // bloque clickjacking
      "form-action 'self'", // les formulaires ne peuvent soumettre qu'en interne
      "upgrade-insecure-requests", // force HTTPS même pour les sous-requêtes
    ].join('; '),
  },
  // Empêche d'afficher le site dans une iframe (clickjacking)
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Empêche le navigateur de deviner le type MIME (injection via upload)
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Masque l'URL complète dans le Referer vers des sites tiers
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Désactive les fonctionnalités sensibles non nécessaires
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
];

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
