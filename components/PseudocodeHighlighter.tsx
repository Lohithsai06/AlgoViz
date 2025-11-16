import React from 'react';

type Props = {
  code: string[];
  highlightLine: number;
};

export default function PseudocodeHighlighter({ code, highlightLine }: Props) {
  return (
    <div className="space-y-2 text-sm">
      {code.map((line, idx) => (
        <div key={idx} className={`px-3 py-1 rounded ${highlightLine === idx ? 'bg-[#0b2230] text-[#00F0FF] font-medium' : 'text-gray-300'}`}>
          <code className="text-sm">{line}</code>
        </div>
      ))}
    </div>
  );
}
