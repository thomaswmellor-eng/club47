'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, X, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface Request {
  id: string;
  proposer_name: string;
  proposer_email: string;
  proposer_company?: string;
  proposer_role?: string;
  proposed_name: string;
  proposed_email: string;
  proposed_role?: string;
  proposed_company?: string;
  proposed_bio?: string;
  proposed_linkedin?: string;
  proposed_image_url?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  reviewed_by_name?: string;
  admin_notes?: string;
  reviewed_at?: string;
  created_at: string;
}

const STATUS_LABELS: Record<Request['status'], string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  completed: 'Complétée',
};

const STATUS_COLORS: Record<Request['status'], string> = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  accepted: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
  completed: 'text-gold-500 bg-gold-500/10 border-gold-500/20',
};

export default function RequestsClient({ requests: initial }: { requests: Request[] }) {
  const [requests, setRequests] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  const accept = async (id: string) => {
    setLoading(id + '-accept');
    try {
      const res = await fetch('/api/admin/accept-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: id }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? 'Erreur'); return; }
      setRequests((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: 'accepted' } : r)
      );
    } finally {
      setLoading(null);
    }
  };

  const reject = async (id: string) => {
    setLoading(id + '-reject');
    try {
      const res = await fetch('/api/admin/reject-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: id, admin_notes: rejectNote[id] ?? '' }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? 'Erreur'); return; }
      setRequests((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: 'rejected' } : r)
      );
    } finally {
      setLoading(null);
    }
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const others = requests.filter((r) => r.status !== 'pending');

  const RequestCard = ({ req }: { req: Request }) => (
    <div className="bg-neutral-900 border border-white/5 overflow-hidden">
      <button
        onClick={() => toggle(req.id)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div>
            <p className="text-white font-medium">{req.proposed_name}</p>
            <p className="text-gray-500 text-xs mt-0.5">{req.proposed_email}</p>
          </div>
          <span className={`px-2 py-0.5 text-xs border rounded-sm ${STATUS_COLORS[req.status]}`}>
            {STATUS_LABELS[req.status]}
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <span className="text-xs hidden sm:block">
            {new Date(req.created_at).toLocaleDateString('fr-FR')}
          </span>
          {expanded === req.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded === req.id && (
        <div className="border-t border-white/5 p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Proposant</p>
              <p className="text-white">{req.proposer_name}</p>
              <p className="text-gray-400">{req.proposer_email}</p>
              {req.proposer_role && <p className="text-gray-500 text-xs">{req.proposer_role}{req.proposer_company ? ` · ${req.proposer_company}` : ''}</p>}
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Proposé</p>
              <p className="text-white">{req.proposed_name}</p>
              <p className="text-gray-400">{req.proposed_email}</p>
              {req.proposed_role && <p className="text-gray-500 text-xs">{req.proposed_role}{req.proposed_company ? ` · ${req.proposed_company}` : ''}</p>}
            </div>
          </div>

          {req.proposed_bio && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Bio</p>
              <p className="text-gray-300 text-sm leading-relaxed">{req.proposed_bio}</p>
            </div>
          )}

          {req.proposed_linkedin && (
            <p className="text-xs">
              <span className="text-gray-500">LinkedIn : </span>
              <a href={req.proposed_linkedin} target="_blank" rel="noopener noreferrer"
                className="text-gold-500 hover:underline">{req.proposed_linkedin}</a>
            </p>
          )}

          {req.status === 'pending' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <textarea
                value={rejectNote[req.id] ?? ''}
                onChange={(e) => setRejectNote((prev) => ({ ...prev, [req.id]: e.target.value }))}
                placeholder="Note de refus (optionnel)..."
                rows={2}
                className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 px-4 py-2 text-sm resize-none focus:outline-none focus:border-gold-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => accept(req.id)}
                  disabled={!!loading}
                  className="flex-1 py-2.5 bg-gold-500 text-black font-bold text-xs tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading === req.id + '-accept' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  ACCEPTER & ENVOYER L&apos;INVITATION
                </button>
                <button
                  onClick={() => reject(req.id)}
                  disabled={!!loading}
                  className="flex-1 py-2.5 border border-red-500/40 text-red-400 font-bold text-xs tracking-widest hover:border-red-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading === req.id + '-reject' ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                  REFUSER
                </button>
              </div>
            </div>
          )}

          {req.status !== 'pending' && req.reviewed_by_name && (
            <p className="text-gray-500 text-xs border-t border-white/5 pt-3">
              Traité par <span className="text-gray-300">{req.reviewed_by_name}</span>
              {req.reviewed_at && ` · ${new Date(req.reviewed_at).toLocaleDateString('fr-FR')}`}
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-charcoal pt-24 md:pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">

        <div className="mb-10">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors text-xs uppercase tracking-widest font-bold mb-6">
            <ArrowLeft size={16} /> Admin
          </Link>
          <h1 className="font-serif text-3xl text-white">
            Demandes de <span className="text-gold-500">membres</span>
          </h1>
        </div>

        {pending.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-yellow-400" />
              <h2 className="text-white font-bold text-sm uppercase tracking-wider">
                En attente ({pending.length})
              </h2>
            </div>
            <div className="space-y-2">
              {pending.map((req) => <RequestCard key={req.id} req={req} />)}
            </div>
          </div>
        )}

        {others.length > 0 && (
          <div>
            <h2 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-4">
              Historique ({others.length})
            </h2>
            <div className="space-y-2">
              {others.map((req) => <RequestCard key={req.id} req={req} />)}
            </div>
          </div>
        )}

        {requests.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">Aucune demande pour l&apos;instant.</p>
          </div>
        )}

      </div>
    </div>
  );
}
