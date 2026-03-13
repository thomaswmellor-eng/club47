import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
          alt="Conference Hall"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="mb-6 inline-block">
          <span className="border border-gold-500/50 text-gold-300 px-4 py-1 text-xs md:text-sm tracking-[0.2em] uppercase bg-black/30 backdrop-blur-sm">
            Le Cercle de l&apos;Élite Digital & Marketing
          </span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
          L&apos;Excellence <br />
          <span className="text-gradient-gold italic pr-2">Connectée</span>
        </h1>

        <p className="font-sans text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Rejoignez le Club 47. Un cercle exclusif de 150 Directeurs Marketing et Digital unis par l&apos;innovation, l&apos;IA et le leadership stratégique.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link
            href="/events"
            className="group relative px-8 py-4 bg-gold-500 text-black font-bold text-sm tracking-widest hover:bg-white transition-colors duration-300 flex items-center gap-2"
          >
            DÉCOUVRIR LE CLUB
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <button className="px-8 py-4 border border-white/20 text-white font-bold text-sm tracking-widest hover:border-gold-500 hover:text-gold-500 transition-all duration-300 bg-black/20 backdrop-blur-sm">
            NOUS CONTACTER
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50">
        <ChevronDown size={32} />
      </div>
    </section>
  );
};

export default Hero;
