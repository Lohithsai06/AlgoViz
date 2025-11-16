'use client';

import { usePathname } from 'next/navigation';
import { algorithmsList } from '@/lib/algorithms-data';

export default function ProgressBar() {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/algorithms') {
    const completedCount = 0;
    const totalCount = algorithmsList.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return (
      <div className="glass-card border border-[#39FF14]/20 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Learning Progress</span>
          <span className="text-sm font-bold neon-text-green">{percentage}%</span>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#39FF14] to-[#00F0FF] transition-all duration-500 neon-glow-green"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completedCount} of {totalCount} algorithms completed
        </p>
      </div>
    );
  }

  return null;
}
