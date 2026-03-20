'use client';

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function ImageUrlHelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gold-400 transition-colors underline underline-offset-2"
      >
        <HelpCircle size={12} />
        Comment faire ?
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-neutral-900 border border-white/10 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                Comment obtenir l&apos;URL de votre photo ?
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <div style={{ position: 'relative', paddingTop: '53.125%' }}>
                <iframe
                  src="https://customer-mdxgfcqxkyxecmm4.cloudflarestream.com/bc27f5ae81530d5aa9fc32b08ca7e16c/iframe?poster=https%3A%2F%2Fcustomer-mdxgfcqxkyxecmm4.cloudflarestream.com%2Fbc27f5ae81530d5aa9fc32b08ca7e16c%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600"
                  loading="lazy"
                  style={{ border: 'none', position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-4 bg-white/5 border border-white/10 px-4 py-3">
                <p className="text-gray-400 text-sm leading-relaxed">
                  💡 <span className="text-white font-semibold">Astuce LinkedIn :</span> rendez-vous sur votre profil LinkedIn, faites un <span className="text-gold-400">clic droit sur votre photo de profil</span>, puis cliquez sur <span className="text-gold-400">&quot;Copier l&apos;adresse de l&apos;image&quot;</span> et collez-la ici.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
