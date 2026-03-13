'use client';

import React, { useState, useEffect } from 'react';
import { Linkedin, Plus, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Member } from '@/lib/types';
import ProposeMemberModal from '@/components/ProposeMemberModal';

const PLACEHOLDER = 'https://ui-avatars.com/api/?background=2a2a2a&color=c9a84c&size=200&name=';

const MemberList: React.FC = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/membres')
      .then((r) => r.json())
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleLinkedinClick = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {showModal && <ProposeMemberModal onClose={() => setShowModal(false)} />}

      <div className="pt-20 md:pt-32 pb-20 min-h-screen bg-charcoal">
        <div className="max-w-7xl mx-auto px-6">

          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Nos <span className="text-gold-500">Membres</span></h2>
              <p className="text-gray-400">
                Découvrez les profils influents qui composent le Club 47. Une communauté d&apos;experts partageant la même vision de l&apos;excellence.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 border border-gold-500 text-gold-500 font-bold text-sm hover:bg-gold-500 hover:text-black transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} />
              PROPOSER UN MEMBRE
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-neutral-900 border border-white/5 p-6 animate-pulse">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-white/5 rounded w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                      <div className="h-3 bg-white/5 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <div className="h-3 bg-white/5 rounded" />
                    <div className="h-3 bg-white/5 rounded w-5/6" />
                    <div className="h-3 bg-white/5 rounded w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Aucun membre pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => router.push(`/members/${member.id}`)}
                  className="bg-neutral-900 border border-white/5 p-6 hover:border-gold-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gold-500/10 transition-all duration-300 group relative overflow-hidden block cursor-pointer"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gold-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                  {member.linkedin && (
                    <div className="absolute top-4 right-4 z-10 transform translate-y-[-10px] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
                      <button
                        onClick={(e) => handleLinkedinClick(e, member.linkedin)}
                        className="p-2 bg-white/5 hover:bg-[#0077b5] text-gray-400 hover:text-white rounded-full transition-colors border border-white/10 hover:border-transparent"
                        aria-label="LinkedIn Profile"
                      >
                        <Linkedin size={18} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-gold-500 transition-colors duration-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.image_url || `${PLACEHOLDER}${encodeURIComponent(member.name)}`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white font-serif group-hover:text-gold-300 transition-colors">{member.name}</h3>
                      {member.role && <p className="text-gold-500 text-sm font-medium mb-1">{member.role}</p>}
                      {member.company && <p className="text-gray-500 text-sm uppercase tracking-wide">{member.company}</p>}
                    </div>
                  </div>

                  {member.bio && (
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 border-t border-white/5 pt-4 line-clamp-3">
                      &quot;{member.bio}&quot;
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gold-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-2 group-hover:translate-x-0">
                      Voir le profil
                    </span>
                    <div className="text-gray-500 group-hover:text-white transition-colors p-2 bg-white/5 rounded-full group-hover:bg-gold-500 group-hover:text-black">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default MemberList;
