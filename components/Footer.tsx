import Link from 'next/link';
import { Github, Zap } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/algorithms', label: 'Algorithms' },
    { href: '/quiz', label: 'Quiz' },
    { href: '/about', label: 'About' },
  ];

  return (
    <footer className="mt-20 glass-card border-t border-[#39FF14]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-6 h-6 neon-text-green" />
              <span className="text-xl font-bold neon-text-green">AlgoViz</span>
            </div>
            <p className="text-gray-400 text-sm">
              Interactive algorithm visualization platform for learning data structures and algorithms with stunning neon aesthetics.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold neon-text-blue mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#00F0FF] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold neon-text-pink mb-4">Connect</h3>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-[#FF10F0] transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm">GitHub</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AlgoViz. Built for DAA learning.</p>
        </div>
      </div>
    </footer>
  );
}
