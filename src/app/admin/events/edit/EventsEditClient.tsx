'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Pencil, Trash2, Loader2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  event_date: string;
  location: string;
  category: string;
}

export default function EventsEditClient({ events: initial }: { events: Event[] }) {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>(initial);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events.filter(e => new Date(e.event_date) >= today);
  const past = events.filter(e => new Date(e.event_date) < today);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents((prev) => prev.filter(e => e.id !== id));
        setConfirmId(null);
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (events.length === 0) {
    return <p className="text-gray-500 text-center py-12">Aucun événement dans la base de données.</p>;
  }

  return (
    <>
      {upcoming.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-4">À venir</h2>
          <div className="space-y-3">
            {upcoming.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                confirmId={confirmId}
                deletingId={deletingId}
                onConfirm={setConfirmId}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Passés</h2>
          <div className="space-y-3">
            {past.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                confirmId={confirmId}
                deletingId={deletingId}
                onConfirm={setConfirmId}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function EventRow({
  event,
  confirmId,
  deletingId,
  onConfirm,
  onDelete,
}: {
  event: Event;
  confirmId: string | null;
  deletingId: string | null;
  onConfirm: (id: string | null) => void;
  onDelete: (id: string) => void;
}) {
  const isConfirming = confirmId === event.id;
  const isDeleting = deletingId === event.id;

  return (
    <div className="bg-neutral-900 border border-white/5 p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{event.title}</p>
        <div className="flex items-center gap-4 mt-1">
          <span className="flex items-center gap-1 text-gray-500 text-xs">
            <Calendar size={12} />
            {event.date}
          </span>
          <span className="flex items-center gap-1 text-gray-500 text-xs">
            <MapPin size={12} />
            {event.location}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isConfirming ? (
          <>
            <span className="text-xs text-gray-400 hidden sm:block">Supprimer ?</span>
            <button
              onClick={() => onDelete(event.id)}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Confirmer
            </button>
            <button
              onClick={() => onConfirm(null)}
              className="px-3 py-2 border border-white/10 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase"
            >
              Annuler
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/admin/events/${event.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 border border-white/10 text-gray-400 hover:border-gold-500 hover:text-gold-500 transition-all duration-200 text-xs font-bold uppercase tracking-wider"
            >
              <Pencil size={13} />
              Modifier
            </Link>
            <button
              onClick={() => onConfirm(event.id)}
              className="flex items-center gap-1.5 px-3 py-2 border border-white/10 text-gray-400 hover:border-red-500 hover:text-red-400 transition-all duration-200 text-xs font-bold uppercase tracking-wider"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
