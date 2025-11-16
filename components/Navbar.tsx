'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Zap } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/algorithms', label: 'Algorithms' },
    { href: '/quiz', label: 'Quiz' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-[#39FF14]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <Zap className="w-8 h-8 neon-text-green transition-all group-hover:scale-110" />
            <span className="text-xl font-bold neon-text-green">AlgoViz</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-all duration-300 hover:neon-glow-green"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-all"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-[#39FF14]/20 glass-card">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 rounded-lg text-gray-300 hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
