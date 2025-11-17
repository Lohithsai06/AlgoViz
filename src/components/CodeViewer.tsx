"use client";

import React, { ReactNode } from 'react';

type Props = { children: ReactNode };

export default function CodeViewer({ children }: Props) {
  return (
    <div className="bg-[#0a0a0f] p-4 rounded-lg text-sm text-gray-300 overflow-x-auto border border-[#00F0FF]/20">
      <pre className="whitespace-pre-wrap font-mono">{children}</pre>
    </div>
  );
}
