'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, Twitter, Linkedin, Tag, Check, Loader2 } from 'lucide-react';
import { Event } from '@/lib/types';
import { createBrowserSupabase } from '@/lib/supabase-client';

const EventList: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [loginPromptId, setLoginPromptId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAccessToken(session.access_token);
        fetch('/api/account/registrations', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setRegisteredIds(new Set(data.map((r: { event_id: string }) => r.event_id)));
            }
          });
      }
      setAuthLoaded(true);
    });
  }, []);

  const handleRegister = async (eventId: string) => {
    if (!accessToken) { setLoginPromptId(eventId); return; }
    setRegisteringId(eventId);
    try {
      await fetch('/api/account/register-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ event_id: eventId }),
      });
      setRegisteredIds((prev) => new Set([...prev, eventId]));
    } finally {
      setRegisteringId(null);
    }
  };

  const upcomingEvents = events.filter(e => e.isUpcoming);
  const pastEvents = events.filter(e => !e.isUpcoming);

  const categories = ['Tous', ...Array.from(new Set(upcomingEvents.map(e => e.category)))];

  const filteredEvents = activeCategory === 'Tous'
    ? upcomingEvents
    : upcomingEvents.filter(e => e.category === activeCategory);

  const handleShare = (platform: 'twitter' | 'linkedin', title: string) => {
    const text = encodeURIComponent(`Je participe à l'événement "${title}" du Club 47 ! #Club47 #Marketing #Digital`);
    const url = encodeURIComponent(window.location.href);

    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${text} ${url}`;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="pt-20 md:pt-32 pb-20 min-h-screen bg-charcoal">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Agenda du <span className="text-gold-500">Club</span></h2>
          </div>
          <div className="space-y-12">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-neutral-900 border border-white/10 overflow-hidden flex flex-col md:flex-row animate-pulse">
                <div className="md:w-2/5 h-48 md:h-72 bg-white/5" />
                <div className="md:w-3/5 p-8 md:p-10 space-y-4">
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                  <div className="h-6 bg-white/5 rounded w-2/3" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-32 pb-20 min-h-screen bg-charcoal">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-10">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Agenda du <span className="text-gold-500">Club</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Des conférences de haut niveau pour anticiper les tendances et transformer vos stratégies.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap justify-center gap-2 md:gap-4 bg-white/5 p-2 rounded-full border border-white/10 backdrop-blur-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-gold-500 text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-neutral-900 border border-white/10 overflow-hidden group hover:border-gold-500/40 transition-all duration-500 flex flex-col md:flex-row"
              >
                <div className="md:w-2/5 relative overflow-hidden">
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <span className="bg-gold-500 text-black font-bold py-1 px-3 text-xs tracking-widest uppercase">
                      À Venir
                    </span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                </div>

                <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-4 text-sm text-gold-300 mb-4 font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Tag size={16} />
                      {event.category}
                    </div>
                  </div>

                  <h3 className="font-serif text-3xl text-white mb-4 group-hover:text-gold-400 transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-gray-400 mb-8 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-white/5 pt-6 mt-auto">
                    {/* Bouton inscription adaptatif */}
                    {loginPromptId === event.id ? (
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href="/account/login"
                          className="px-5 py-2.5 bg-gold-500 text-black font-bold text-xs hover:bg-white transition-all duration-300 inline-flex items-center gap-2"
                        >
                          SE CONNECTER
                        </Link>
                        <Link
                          href="/account/become-member"
                          className="px-5 py-2.5 border border-gold-500 text-gold-500 font-bold text-xs hover:bg-gold-500 hover:text-black transition-all duration-300 inline-flex items-center gap-2"
                        >
                          DEVENIR MEMBRE
                        </Link>
                        <button
                          onClick={() => setLoginPromptId(null)}
                          className="px-3 py-2.5 border border-white/10 text-gray-500 text-xs hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : registeredIds.has(event.id) ? (
                      <span className="px-6 py-3 bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-sm inline-flex items-center gap-2">
                        <Check size={16} />
                        INSCRIT
                      </span>
                    ) : (
                      <button
                        onClick={() => authLoaded && handleRegister(event.id)}
                        disabled={registeringId === event.id}
                        className="px-6 py-3 bg-white text-black font-bold text-sm hover:bg-gold-500 hover:text-white transition-all duration-300 inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        {registeringId === event.id
                          ? <><Loader2 size={16} className="animate-spin" /> Inscription...</>
                          : <>{authLoaded ? "S\u2019INSCRIRE À L\u2019ÉVÉNEMENT" : "S\u2019INSCRIRE À L\u2019ÉVÉNEMENT"}<ArrowRight size={16} /></>
                        }
                      </button>
                    )}

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 uppercase tracking-widest hidden sm:block">Partager</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShare('twitter', event.title)}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-[#1DA1F2] hover:text-white transition-all duration-300 border border-transparent hover:border-white/10"
                          aria-label="Partager sur Twitter"
                        >
                          <Twitter size={16} />
                        </button>
                        <button
                          onClick={() => handleShare('linkedin', event.title)}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-[#0A66C2] hover:text-white transition-all duration-300 border border-transparent hover:border-white/10"
                          aria-label="Partager sur LinkedIn"
                        >
                          <Linkedin size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-lg bg-white/5">
              <p className="text-gray-400 font-serif text-lg">Aucun événement ne correspond à la catégorie <span className="text-gold-500">&quot;{activeCategory}&quot;</span>.</p>
              <button
                onClick={() => setActiveCategory('Tous')}
                className="mt-4 text-sm text-white underline hover:text-gold-500 transition-colors"
              >
                Voir tous les événements
              </button>
            </div>
          )}
        </div>

        {/* Past Events Section */}
        {pastEvents.length > 0 && (
        <div className="mt-24">
          <h3 className="text-2xl text-white font-serif mb-8 border-b border-white/10 pb-4">Événements Passés</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {pastEvents.map((event) => (
              <div key={event.id} className="group cursor-pointer">
                <div className="relative h-48 mb-4 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute bottom-0 left-0 bg-black/70 px-4 py-1 text-gold-300 text-xs font-bold">
                    {event.date}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{event.category}</div>
                <h4 className="text-lg font-bold text-white group-hover:text-gold-500 transition-colors mb-2">
                  {event.title}
                </h4>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin size={14} />
                  {event.location}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

      </div>
    </div>
  );
};

export default EventList;
