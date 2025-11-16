import { Zap, Target, Lightbulb, Rocket } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Zap,
      title: 'Interactive Visualizations',
      description: 'Watch algorithms come to life with stunning neon-themed animations and step-by-step execution.',
    },
    {
      icon: Target,
      title: 'Comprehensive Coverage',
      description: 'From basic sorting algorithms to advanced graph and dynamic programming techniques.',
    },
    {
      icon: Lightbulb,
      title: 'Learning-Focused',
      description: 'Designed specifically for Design and Analysis of Algorithms (DAA) coursework and self-study.',
    },
    {
      icon: Rocket,
      title: 'Custom Inputs',
      description: 'Test algorithms with your own data and see exactly how they perform in different scenarios.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="neon-text-green">About</span>{' '}
          <span className="neon-text-blue">AlgoViz</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
          An interactive algorithm visualization platform designed to make learning data structures and algorithms engaging and intuitive
        </p>
      </div>

      <div className="glass-card rounded-lg p-8 md:p-12 border border-[#39FF14]/20 mb-16">
        <h2 className="text-3xl font-bold neon-text-green mb-6">Our Mission</h2>
        <p className="text-gray-300 text-lg leading-relaxed mb-4">
          AlgoViz was created to bridge the gap between theoretical computer science concepts and practical understanding.
          We believe that visualizing algorithms in action is the best way to truly comprehend how they work.
        </p>
        <p className="text-gray-300 text-lg leading-relaxed">
          Our neon cyberpunk aesthetic is not just for show - it is designed to keep you engaged and make learning
          algorithms an exciting experience rather than a daunting task.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold neon-text-pink text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card rounded-lg p-6 border border-gray-800 hover:border-[#39FF14]/50 transition-all hover:neon-glow-green"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-[#39FF14]/10 to-[#00F0FF]/10 border border-[#39FF14]/20">
                  <feature.icon className="w-6 h-6 neon-text-green" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold neon-text-blue mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-lg p-8 md:p-12 border border-[#00F0FF]/20">
        <h2 className="text-3xl font-bold neon-text-blue mb-6">What You Will Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold neon-text-green mb-4">Basic Algorithms</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#39FF14] rounded-full" />
                <span>Bubble Sort</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#39FF14] rounded-full" />
                <span>Insertion Sort</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#39FF14] rounded-full" />
                <span>Selection Sort</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold neon-text-pink mb-4">Advanced Algorithms</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#FF10F0] rounded-full" />
                <span>Merge Sort & Quick Sort</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#FF10F0] rounded-full" />
                <span>Graph Algorithms (BFS, DFS, Dijkstra)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#FF10F0] rounded-full" />
                <span>Dynamic Programming (Knapsack)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#FF10F0] rounded-full" />
                <span>Backtracking (N-Queens)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center glass-card rounded-lg p-8 border border-[#39FF14]/20">
        <h2 className="text-2xl font-bold neon-text-green mb-4">Built for Students</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-6">
          Whether you are preparing for exams, working on assignments, or simply curious about how algorithms work,
          AlgoViz is here to help you master Design and Analysis of Algorithms.
        </p>
        <div className="flex justify-center gap-4">
          <span className="px-4 py-2 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-sm">
            DAA Coursework
          </span>
          <span className="px-4 py-2 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-sm">
            Interview Prep
          </span>
          <span className="px-4 py-2 rounded-full bg-[#FF10F0]/10 border border-[#FF10F0]/30 text-[#FF10F0] text-sm">
            Self Learning
          </span>
        </div>
      </div>
    </div>
  );
}
