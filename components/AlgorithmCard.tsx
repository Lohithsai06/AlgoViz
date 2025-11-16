import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface AlgorithmCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  difficulty: 'Basic' | 'Advanced';
}

export default function AlgorithmCard({
  id,
  title,
  description,
  category,
  icon: Icon,
  difficulty,
}: AlgorithmCardProps) {
  const difficultyColor = difficulty === 'Basic' ? 'text-[#39FF14]' : 'text-[#FF10F0]';
  const glowColor = difficulty === 'Basic' ? 'hover:neon-glow-green' : 'hover:neon-glow-pink';

  return (
    <Link href={`/algorithms/${id}`}>
      <div
        className={`glass-card rounded-xl p-6 border border-gray-800 hover:border-[#39FF14]/50 transition-all duration-300 ${glowColor} hover:-translate-y-1 group cursor-pointer h-full`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-[#39FF14]/10 to-[#00F0FF]/10 border border-[#39FF14]/20 group-hover:neon-glow-green transition-all">
            <Icon className="w-6 h-6 neon-text-green" />
          </div>
          <span className={`text-xs font-semibold ${difficultyColor} px-3 py-1 rounded-full border border-current`}>
            {difficulty}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:neon-text-green transition-all">
          {title}
        </h3>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#00F0FF] font-medium">{category}</span>
          <span className="text-xs text-gray-500 group-hover:text-[#39FF14] transition-colors">
            Visualize →
          </span>
        </div>
      </div>
    </Link>
  );
}
