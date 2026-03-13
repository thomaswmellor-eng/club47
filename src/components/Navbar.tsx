'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/events', label: 'Événements à venir' },
    { path: '/members', label: 'Focus sur nos membres' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-midnight/90 backdrop-blur-md border-b border-white/10 py-2'
          : 'bg-transparent py-3 md:py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="cursor-pointer group flex flex-col items-center justify-center"
        >
          <div className="flex items-baseline relative">
            <span className="font-serif text-xl md:text-3xl text-white tracking-widest group-hover:text-gold-300 transition-colors duration-500">CLUB</span>
            <span className="font-serif text-2xl md:text-4xl italic text-white ml-2 font-light group-hover:text-gold-500 transition-colors duration-500">47</span>
          </div>

          {/* Stylized Paris Skyline SVG — hidden on mobile */}
          <div className="hidden md:flex relative w-full justify-center overflow-hidden h-6 mt-[-4px]">
            <svg viewBox="0 0 120 20" className="h-full w-auto text-gold-500 group-hover:text-white transition-colors duration-500 fill-none stroke-current stroke-1">
              <path d="M0 18 H10 L10 12 L15 12 L15 18 L20 18 L20 10 L25 5 L30 10 L30 18 L40 18 L45 2 L50 18 L60 18 L60 8 L70 8 L70 18 L80 18 L80 14 L85 14 L85 18 L120 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Subtitle — hidden on mobile */}
          <span className="hidden md:block font-sans text-[0.6rem] font-bold text-gray-400 tracking-[0.2em] uppercase mt-[-2px] group-hover:text-gold-300 transition-colors">
            Marketing & Digital Directors
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-sm font-medium tracking-wide transition-all duration-300 relative group ${
                isActive(link.path) ? 'text-gold-500' : 'text-gray-300 hover:text-white'
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-gold-500 transition-all duration-300 group-hover:w-full ${isActive(link.path) ? 'w-full' : ''}`}></span>
            </Link>
          ))}
          <Link href="/account" className="bg-white text-black px-6 py-2 text-sm font-bold hover:bg-gold-500 hover:text-white transition-all duration-300">
            ESPACE MEMBRE
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white hover:text-gold-500">
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-neutral-900 border-b border-white/10 py-6 px-6 flex flex-col space-y-4 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-left text-lg font-medium ${
                isActive(link.path) ? 'text-gold-500' : 'text-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="bg-gold-500 text-black px-6 py-3 text-sm font-bold w-full mt-4 block text-center">
            ESPACE MEMBRE
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
