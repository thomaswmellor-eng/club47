import React from 'react';
import { Users, Calendar, Award, Zap } from 'lucide-react';
import Image from 'next/image';

const MissionStats: React.FC = () => {
  const stats = [
    {
      icon: <Users size={32} />,
      value: "150",
      label: "Leaders",
      desc: "Top CPG, Retail, Beauté & Services"
    },
    {
      icon: <Calendar size={32} />,
      value: "8",
      label: "Années d'Existence",
      desc: "Fondé par des passionnés"
    },
    {
      icon: <Award size={32} />,
      value: "100%",
      label: "Cooptation",
      desc: "Cercle privé et confidentiel"
    },
    {
      icon: <Zap size={32} />,
      value: "3-4",
      label: "Rencontres / An",
      desc: "Stratégie Marque, Digital & IA"
    }
  ];

  return (
    <div className="bg-charcoal pt-12 pb-24 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">
              L&apos;Esprit <span className="text-gold-500">Club 47</span>
            </h2>
            <div className="w-20 h-1 bg-gold-500 mb-8"></div>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Fondé il y a 8 ans à l&apos;initiative de directeurs marketing (Canderel, Coca-Cola, Andros), le Club 47 est un cercle exclusif réunissant aujourd&apos;hui 150 leaders du marketing et du digital.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Nos membres sont issus des &quot;top CPG companies&quot; (Nestlé, Danone, Bel...) ainsi que des géants du Retail, du Luxe et des Services (Decathlon, Disney, EssilorLuxottica, Sodexo...).
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              L&apos;inscription se fait uniquement par cooptation. Nos échanges, informels et confidentiels, s&apos;articulent autour de retours d&apos;expérience concrets : stratégies de marque, transformation digitale et, désormais, la révolution de l&apos;IA.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 border-2 border-gold-500/20 transform translate-x-4 translate-y-4"></div>
            <div className="relative w-full aspect-[4/3]">
              <Image
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
                alt="Meeting"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-neutral-900/50 p-8 border border-white/5 hover:border-gold-500/30 transition-all duration-300 group text-center md:text-left"
            >
              <div className="text-gold-500 mb-4 inline-block p-3 bg-gold-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <h3 className="text-4xl font-bold text-white mb-2 font-serif">{stat.value}</h3>
              <p className="text-gold-300 font-medium mb-2 uppercase tracking-wide text-sm">{stat.label}</p>
              <p className="text-gray-500 text-sm">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MissionStats;
