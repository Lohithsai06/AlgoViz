'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import AlgorithmCard from '@/components/AlgorithmCard';
import { algorithmsList } from '@/lib/algorithms-data';

export default function AlgorithmsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(algorithmsList.map((algo) => algo.category)))];

  const filteredAlgorithms = algorithmsList.filter((algo) => {
    const matchesSearch =
      algo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || algo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="neon-text-green">All</span>{' '}
          <span className="neon-text-blue">Algorithms</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Explore our complete collection of algorithm visualizations
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#13131a] border border-gray-800 rounded-lg focus:border-[#39FF14] focus:neon-glow-green outline-none transition-all text-gray-100"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-[#39FF14] text-black neon-glow-green'
                  : 'bg-[#13131a] text-gray-400 border border-gray-800 hover:border-[#39FF14]/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlgorithms.map((algo) => (
          <AlgorithmCard key={algo.id} {...algo} />
        ))}
      </div>

      {filteredAlgorithms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No algorithms found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
