'use client';

import React, { useState } from 'react';
import { Loader2, Save, Sparkles } from 'lucide-react';

interface MissingField {
  key: 'role' | 'company' | 'linkedin' | 'image_url' | 'bio';
  label: string;
  placeholder: string;
  type: 'text' | 'url' | 'textarea';
}

interface Props {
  missingFields: MissingField[];
  accessToken: string;
  memberName: string;
  existingValues: Record<string, string>;
  onComplete: (values: Record<string, string>) => void;
  onSkip: () => void;
}

export default function ProfileCompletionModal({ missingFields, accessToken, memberName, existingValues, onComplete, onSkip }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(missingFields.map((f) => [f.key, '']))
  );
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);

  const current = missingFields[step];
  const isLast = step === missingFields.length - 1;
  const total = missingFields.length;

  const handleNext = async () => {
    if (isLast) {
      setSaving(true);
      try {
        await fetch('/api/account/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
          body: JSON.stringify({ name: memberName, ...existingValues, ...values }),
        });
        onComplete(values);
      } finally {
        setSaving(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkipField = () => {
    if (isLast) {
      onSkip();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-white/10 w-full max-w-md relative overflow-hidden">

        <div className="h-0.5 bg-white/5 w-full">
          <div
            className="h-full bg-gold-500 transition-all duration-500"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gold-500/10 border border-gold-500/20">
              <Sparkles size={16} className="text-gold-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                {step + 1} / {total}
              </p>
              <h2 className="text-white font-bold text-sm">Complétez votre profil</h2>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              {current.label}
            </label>

            {current.key === 'image_url' ? (
              <div>
                <input
                  type="url"
                  value={values[current.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [current.key]: e.target.value }))}
                  placeholder={current.placeholder}
                  className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors text-sm"
                />
                {values[current.key] && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gold-500/20 bg-white/5 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={values[current.key]}
                        alt="apercu"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <span className="text-gray-600 text-xs">Apercu</span>
                  </div>
                )}
              </div>
            ) : current.key === 'bio' ? (
              <textarea
                value={values[current.key]}
                onChange={(e) => setValues((v) => ({ ...v, [current.key]: e.target.value }))}
                placeholder={current.placeholder}
                autoFocus
                rows={4}
                className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors text-sm resize-none"
              />
            ) : (
              <input
                type="text"
                value={values[current.key]}
                onChange={(e) => setValues((v) => ({ ...v, [current.key]: e.target.value }))}
                placeholder={current.placeholder}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && values[current.key].trim() && handleNext()}
                className="w-full bg-black/40 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors text-sm"
              />
            )}
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={handleNext}
              disabled={saving || !values[current.key].trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-black font-bold text-xs hover:bg-white transition-colors disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> Sauvegarde...</>
              ) : isLast ? (
                <><Save size={14} /> Terminer</>
              ) : (
                <>Suivant &rarr;</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
