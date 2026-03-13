import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">

          {/* Brand */}
          <div>
            <span className="font-serif text-3xl font-bold text-white tracking-widest block mb-6">
              CLUB <span className="text-gold-500">47</span>
            </span>
            <p className="text-gray-500 text-sm leading-relaxed">
              Le cercle exclusif des dirigeants Marketing & Digital.
              <br />Inspiration, Connexion, Excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/#about" className="text-gray-500 hover:text-gold-500 transition-colors">
                  À propos du Club
                </Link>
              </li>
              <li>
                <Link href="/account/become-member" className="text-gray-500 hover:text-gold-500 transition-colors">
                  Devenir Membre
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-500 hover:text-gold-500 transition-colors">
                  Agenda 2026
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-gray-500 hover:text-gold-500 transition-colors">
                  Espace Membre
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">Contact</h4>
            <div className="space-y-4 text-gray-500 text-sm">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gold-500" />
                <span>47 Avenue de l&apos;Opéra, 75002 Paris</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gold-500" />
                <span>contact@club47.fr</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gold-500" />
                <span>+33 1 42 47 47 47</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>&copy; 2026 Club 47. Tous droits réservés.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>Confidentialité</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
