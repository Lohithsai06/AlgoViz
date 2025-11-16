'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import AlgorithmCard from '@/components/AlgorithmCard';
import ProgressBar from '@/components/ProgressBar';
import { algorithmsList } from '@/lib/algorithms-data';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Basic' | 'Advanced'>('All');

  const filteredAlgorithms = algorithmsList.filter((algo) => {
    const matchesSearch = algo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' || algo.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const basicAlgorithms = filteredAlgorithms.filter((algo) => algo.difficulty === 'Basic');
  const advancedAlgorithms = filteredAlgorithms.filter((algo) => algo.difficulty === 'Advanced');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="neon-text-green">Algorithm</span>{' '}
          <span className="neon-text-blue">Visualizer</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Master data structures and algorithms through interactive neon-themed visualizations
        </p>
      </div>

      <ProgressBar />

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#13131a] border border-gray-800 rounded-lg focus:border-[#39FF14] focus:neon-glow-green outline-none transition-all text-gray-100"
          />
        </div>

        <div className="flex gap-2">
          {(['All', 'Basic', 'Advanced'] as const).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedDifficulty === difficulty
                  ? 'bg-[#39FF14] text-black neon-glow-green'
                  : 'bg-[#13131a] text-gray-400 border border-gray-800 hover:border-[#39FF14]/50'
              }`}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      {basicAlgorithms.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold neon-text-green mb-6">Basic Algorithms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {basicAlgorithms.map((algo) => (
              <AlgorithmCard key={algo.id} {...algo} />
            ))}
          </div>
        </section>
      )}

      {advancedAlgorithms.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold neon-text-pink mb-6">Advanced Algorithms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedAlgorithms.map((algo) => (
              <AlgorithmCard key={algo.id} {...algo} />
            ))}
          </div>
        </section>
      )}

      {filteredAlgorithms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No algorithms found matching your search.</p>
        </div>
      )}
    </div>
  );
}
