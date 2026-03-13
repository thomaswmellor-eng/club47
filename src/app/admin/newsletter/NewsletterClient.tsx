'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, FileText, Send, Trash2, Eye, Edit3,
  Loader2, Check, Users, Clock, ChevronRight, X,
} from 'lucide-react';

interface Newsletter {
  id: string;
  title: string;
  subject: string;
  status: 'draft' | 'sent';
  sent_at?: string;
  recipient_count?: number;
  created_at: string;
}

interface Props {
  initialNewsletters: Newsletter[];
  subscriberCount: number;
}

type View = 'list' | 'editor';
type EditorTab = 'edit' | 'preview';

function buildPreviewHtml(subject: string, body: string): string {
  const htmlBody = body
    .split('\n\n')
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="color:#aaa;line-height:1.8;margin-bottom:20px;">${p.replace(/\n/g, '<br>')}</p>`
    )
    .join('');

  return `<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#111;">
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#fff;padding:40px;">
      <h1 style="color:#c9a84c;font-size:28px;margin-bottom:8px;letter-spacing:4px;">CLUB 47</h1>
      <div style="height:2px;background:#c9a84c;width:60px;margin-bottom:32px;"></div>
      <p style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin-bottom:24px;">
        Objet : ${subject || '(sans sujet)'}
      </p>
      ${htmlBody || '<p style="color:#555;font-style:italic;">Corps vide</p>'}
      <p style="color:#555;font-size:12px;margin-top:40px;border-top:1px solid #2a2a2a;padding-top:20px;line-height:1.6;">
        Club 47 — Le cercle d'excellence Marketing &amp; Digital
      </p>
    </div>
  </body></html>`;
}

export default function NewsletterClient({ initialNewsletters, subscriberCount }: Props) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>(initialNewsletters);
  const [view, setView] = useState<View>('list');
  const [editorTab, setEditorTab] = useState<EditorTab>('edit');

  // Editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number } | null>(null);

  const openNew = () => {
    setEditingId(null);
    setTitle('');
    setSubject('');
    setBody('');
    setEditorTab('edit');
    setSaveSuccess(false);
    setSendResult(null);
    setConfirmSend(false);
    setView('editor');
  };

  const openEdit = (nl: Newsletter) => {
    setEditingId(nl.id);
    setTitle(nl.title);
    setSubject(nl.subject);
    setBody(''); // will be loaded
    setEditorTab('edit');
    setSaveSuccess(false);
    setSendResult(null);
    setConfirmSend(false);
    setView('editor');

    // Load full body
    fetch(`/api/admin/newsletter/${nl.id}`)
      .then((r) => r.json())
      .then((data) => setBody(data.body ?? ''));
  };

  const handleSave = async () => {
    if (!title.trim() || !subject.trim()) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      if (editingId) {
        await fetch(`/api/admin/newsletter/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, subject, body }),
        });
        setNewsletters((prev) =>
          prev.map((nl) => nl.id === editingId ? { ...nl, title, subject } : nl)
        );
      } else {
        const res = await fetch('/api/admin/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, subject, body }),
        });
        const data = await res.json();
        setEditingId(data.id);
        setNewsletters((prev) => [
          { id: data.id, title, subject, status: 'draft', created_at: new Date().toISOString() },
          ...prev,
        ]);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNewsletters((prev) => prev.filter((nl) => nl.id !== id));
        if (editingId === id) setView('list');
      }
    } finally {
      setDeleting(null);
    }
  };

  const handleSend = async () => {
    if (!editingId) return;
    setSending(true);
    try {
      // Save first
      await fetch(`/api/admin/newsletter/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subject, body }),
      });
      const res = await fetch(`/api/admin/newsletter/${editingId}/send`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSendResult({ sent: data.sent });
        setNewsletters((prev) =>
          prev.map((nl) =>
            nl.id === editingId
              ? { ...nl, status: 'sent', sent_at: new Date().toISOString(), recipient_count: data.sent }
              : nl
          )
        );
      }
    } finally {
      setSending(false);
      setConfirmSend(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const currentIsSent = editingId
    ? newsletters.find((nl) => nl.id === editingId)?.status === 'sent'
    : false;

  // ── LIST VIEW ──
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-charcoal pt-24 md:pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="font-serif text-3xl text-white">Newsletter</h1>
                <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
                  <Users size={12} />
                  {subscriberCount} abonné{subscriberCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors"
            >
              <Plus size={14} />
              Nouvelle
            </button>
          </div>

          {newsletters.length === 0 ? (
            <div className="border border-dashed border-white/10 p-16 text-center">
              <FileText size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Aucune newsletter. Créez-en une.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {newsletters.map((nl) => (
                <div
                  key={nl.id}
                  className="bg-neutral-900 border border-white/5 hover:border-white/10 p-5 flex items-center gap-4 transition-colors group cursor-pointer"
                  onClick={() => nl.status === 'draft' && openEdit(nl)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border ${
                          nl.status === 'sent'
                            ? 'text-green-400 border-green-500/30 bg-green-500/10'
                            : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                        }`}
                      >
                        {nl.status === 'sent' ? 'Envoyée' : 'Brouillon'}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-sm group-hover:text-gold-300 transition-colors truncate">
                      {nl.title}
                    </p>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{nl.subject}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-gray-600 text-xs">
                        <Clock size={10} />
                        {formatDate(nl.created_at)}
                      </span>
                      {nl.status === 'sent' && nl.recipient_count != null && (
                        <span className="flex items-center gap-1 text-gray-600 text-xs">
                          <Send size={10} />
                          {nl.recipient_count} destinataire{nl.recipient_count > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {nl.status === 'draft' && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(nl); }}
                          className="p-2 border border-white/10 text-gray-500 hover:border-gold-500 hover:text-gold-400 transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(nl.id); }}
                          disabled={deleting === nl.id}
                          className="p-2 border border-white/10 text-gray-500 hover:border-red-500/50 hover:text-red-400 transition-all"
                        >
                          {deleting === nl.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </>
                    )}
                    {nl.status === 'draft' && (
                      <ChevronRight size={14} className="text-gray-600 group-hover:text-gold-500 transition-colors" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EDITOR VIEW ──
  return (
    <div className="min-h-screen bg-charcoal pt-24 md:pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('list')}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-serif text-3xl text-white">
                {editingId ? 'Modifier' : 'Nouvelle newsletter'}
              </h1>
              {currentIsSent && (
                <p className="text-green-400 text-xs mt-0.5 flex items-center gap-1">
                  <Check size={11} /> Envoyée
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!currentIsSent && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving || !title.trim() || !subject.trim()}
                  className="flex items-center gap-2 px-4 py-2 border border-white/10 text-gray-300 hover:border-gold-500 hover:text-gold-400 transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                  {saveSuccess ? <><Check size={13} className="text-green-400" /> Sauvegardé</> : 'Sauvegarder'}
                </button>
                {editingId && (
                  <button
                    onClick={() => setConfirmSend(true)}
                    disabled={!title.trim() || !subject.trim() || !body.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-40"
                  >
                    <Send size={13} />
                    Envoyer ({subscriberCount})
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Send result */}
        {sendResult && (
          <div className="mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/30 px-5 py-4">
            <Check size={16} className="text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm font-semibold">
              Newsletter envoyée à {sendResult.sent} abonné{sendResult.sent > 1 ? 's' : ''} avec succès.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          <button
            onClick={() => setEditorTab('edit')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              editorTab === 'edit' ? 'bg-gold-500 text-black' : 'border border-white/10 text-gray-500 hover:text-white'
            }`}
          >
            <Edit3 size={12} />
            Éditeur
          </button>
          <button
            onClick={() => setEditorTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              editorTab === 'preview' ? 'bg-gold-500 text-black' : 'border border-white/10 text-gray-500 hover:text-white'
            }`}
          >
            <Eye size={12} />
            Aperçu
          </button>
        </div>

        {editorTab === 'edit' ? (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Titre interne <span className="text-red-400">*</span>
                <span className="text-gray-600 normal-case font-normal ml-2">(non visible par les abonnés)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={currentIsSent}
                placeholder="ex : Newsletter avril 2025"
                className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors text-sm disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Objet de l&apos;e-mail <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={currentIsSent}
                placeholder="ex : Les tendances Marketing à ne pas manquer"
                className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-3 text-white placeholder-gray-600 transition-colors text-sm disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Corps de l&apos;e-mail
              </label>
              <p className="text-gray-600 text-xs mb-2">
                Séparez les paragraphes par une ligne vide. Les retours à la ligne simples sont préservés.
              </p>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={currentIsSent}
                rows={18}
                placeholder={`Bonjour,\n\nVoici les dernières actualités du Club 47...\n\nCordialement,\nL'équipe Club 47`}
                className="w-full bg-neutral-900 border border-white/10 focus:border-gold-500 outline-none px-4 py-4 text-white placeholder-gray-600 transition-colors text-sm resize-none font-mono leading-relaxed disabled:opacity-50"
              />
            </div>
          </div>
        ) : (
          <div className="border border-white/10">
            <div className="bg-neutral-900 border-b border-white/5 px-4 py-2 flex items-center gap-2">
              <Eye size={13} className="text-gray-500" />
              <span className="text-gray-500 text-xs uppercase tracking-wider">Aperçu email</span>
            </div>
            <iframe
              srcDoc={buildPreviewHtml(subject, body)}
              className="w-full"
              style={{ height: '600px', border: 'none', background: '#111' }}
              title="Email preview"
            />
          </div>
        )}
      </div>

      {/* Confirm send modal */}
      {confirmSend && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-white/10 w-full max-w-sm p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-white font-bold text-lg">Confirmer l&apos;envoi</h2>
                <p className="text-gray-500 text-sm mt-1">Cette action est irréversible.</p>
              </div>
              <button onClick={() => setConfirmSend(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-3 mb-6">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Objet</p>
              <p className="text-white text-sm font-semibold">{subject}</p>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              L&apos;e-mail sera envoyé à{' '}
              <span className="text-gold-500 font-bold">{subscriberCount} abonné{subscriberCount > 1 ? 's' : ''}</span>.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmSend(false)}
                className="flex-1 py-3 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all text-sm font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold-500 text-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
