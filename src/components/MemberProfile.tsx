'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Linkedin, Mail, Award, Briefcase } from 'lucide-react';
import { Member } from '@/lib/types';

interface Props {
  member: Member;
}

const PLACEHOLDER = 'https://ui-avatars.com/api/?background=2a2a2a&color=c9a84c&size=400&name=';

const MemberProfile: React.FC<Props> = ({ member }) => {
  return (
    <div className="min-h-screen bg-charcoal pt-20 md:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-10">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <ArrowLeft size={16} />
            Retour aux membres
          </Link>
        </div>

        <div className="bg-neutral-900 border border-white/5 overflow-hidden">
          <div className="flex flex-col lg:flex-row">

            {/* Left Column: Image */}
            <div className="lg:w-2/5 relative">
              <div className="aspect-[3/4] lg:aspect-auto lg:h-full relative group">
                <div className="absolute inset-0 bg-gold-500/10 z-10 mix-blend-overlay" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.image_url || `${PLACEHOLDER}${encodeURIComponent(member.name)}`}
                  alt={member.name}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="lg:w-3/5 p-8 md:p-16 flex flex-col justify-center relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-bl-full" />

              <div className="mb-8">
                <h1 className="font-serif text-4xl md:text-5xl text-white mb-2">{member.name}</h1>
                <div className="h-1 w-20 bg-gold-500 mb-6" />
                {member.role && (
                  <h2 className="text-xl md:text-2xl text-gold-300 font-medium mb-1">{member.role}</h2>
                )}
                {member.company && (
                  <p className="text-gray-400 text-lg uppercase tracking-wide">{member.company}</p>
                )}
              </div>

              <div className="space-y-8 mb-12">
                {member.bio && (
                  <div className="bg-white/5 p-6 border-l-2 border-gold-500">
                    <h3 className="text-gold-500 font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                      <Briefcase size={18} />
                      Biographie
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-lg">{member.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {member.expertise && member.expertise.length > 0 && (
                    <div className="bg-black/20 p-4 border border-white/5">
                      <h3 className="text-white font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
                        <Award size={16} className="text-gold-500" />
                        Expertise
                      </h3>
                      <p className="text-gray-400 text-sm">{member.expertise.join(', ')}</p>
                    </div>
                  )}
                  {member.year_joined && (
                    <div className="bg-black/20 p-4 border border-white/5">
                      <h3 className="text-white font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
                        <Award size={16} className="text-gold-500" />
                        Ancienneté Club
                      </h3>
                      <p className="text-gray-400 text-sm">Membre depuis {member.year_joined}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-auto pt-8 border-t border-white/10">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex-1 md:flex-none px-8 py-3 bg-gold-500 text-black font-bold text-sm hover:bg-white transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Mail size={18} />
                    CONTACTER
                  </a>
                )}
                {member.linkedin && (
                  <button
                    onClick={() => {
                      const url = member.linkedin!.startsWith('http') ? member.linkedin! : `https://${member.linkedin}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="flex-1 md:flex-none px-8 py-3 border border-white/20 text-white font-bold text-sm hover:border-gold-500 hover:text-gold-500 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Linkedin size={18} />
                    LINKEDIN
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
