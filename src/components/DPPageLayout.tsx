"use client";

import React, { ReactNode, useEffect, useState } from 'react';

export type DPPageLayoutProps = {
  title: string;
  description?: string;
  visualization: ReactNode;
  codeContent: ReactNode;
  infoContent: ReactNode;
  playerControls?: ReactNode;
  customInput?: ReactNode;
  initialTab?: 'visualization' | 'code' | 'info';
  onTabChange?: (tab: 'visualization' | 'code' | 'info') => void;
};

export default function DPPageLayout({ title, description, visualization, codeContent, infoContent, playerControls, customInput, initialTab = 'visualization', onTabChange }: DPPageLayoutProps) {
  const [activeTab, setActiveTab] = useState<'visualization' | 'code' | 'info'>(initialTab);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => onTabChange && onTabChange(activeTab), [activeTab, onTabChange]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold neon-text-green mb-2">{title}</h1>
        {description && <p className="text-gray-400">{description}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-lg border border-[#39FF14]/20 overflow-hidden">
            <div className="flex border-b border-gray-800">
              {!isSmall ? (
                <>
                  <button onClick={() => setActiveTab('visualization')} className={`flex-1 px-6 py-3 font-medium transition-all ${activeTab === 'visualization' ? 'bg-[#39FF14]/10 text-[#39FF14] border-b-2 border-[#39FF14]' : 'text-gray-400 hover:text-gray-300'}`}>Visualization</button>
                  <button onClick={() => setActiveTab('code')} className={`flex-1 px-6 py-3 font-medium transition-all ${activeTab === 'code' ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-b-2 border-[#00F0FF]' : 'text-gray-400 hover:text-gray-300'}`}>Code</button>
                  <button onClick={() => setActiveTab('info')} className={`flex-1 px-6 py-3 font-medium transition-all ${activeTab === 'info' ? 'bg-[#FF10F0]/10 text-[#FF10F0] border-b-2 border-[#FF10F0]' : 'text-gray-400 hover:text-gray-300'}`}>Info</button>
                </>
              ) : (
                <div className="w-full p-3">
                  <select value={activeTab} onChange={(e) => setActiveTab(e.target.value as any)} className="w-full bg-[#0b0b10] text-gray-100 px-3 py-2 rounded border border-gray-800">
                    <option value="visualization">Visualization</option>
                    <option value="code">Code</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              )}
            </div>

            <div className="p-6">
              {activeTab === 'visualization' && (
                <div>
                  {visualization ? visualization : <div className="p-6 text-sm text-gray-400">Apply inputs to generate DP steps and visualize here.</div>}
                </div>
              )}

              {activeTab === 'code' && (
                <div>
                  {codeContent}
                </div>
              )}

              {activeTab === 'info' && (
                <div>
                  {infoContent}
                </div>
              )}
            </div>
          </div>

          {/* Custom input area (optional) */}
          {/** Render custom input UI provided by caller immediately below the tabs/visualization */}
          {/** Render custom input UI provided by caller immediately below the tabs/visualization */}
          <div>{customInput}</div>
        </div>

        <div className="space-y-6">
          {playerControls}
        </div>
      </div>
    </div>
  );
}
