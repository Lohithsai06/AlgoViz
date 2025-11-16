import React from 'react';

type HighlightType = 'init' | 'compare' | 'include' | 'exclude' | 'match' | 'mismatch' | 'select' | 'current' | 'write';

interface DPTableVisualizerProps {
  table?: number[][];
  rowLabels?: string[]; // e.g., items or string chars (with leading empty)
  colLabels?: string[]; // e.g., capacities or string chars (with leading empty)
  highlight?: { i: number; j: number; type: HighlightType } | null;
  includedCells?: { i: number; j: number }[];
  excludedCells?: { i: number; j: number }[];
  selectedItems?: (number | string)[] | null;
  pseudocodeLine?: number | null;
  splitTable?: (number | null)[][] | null;
  selectedParenthesization?: string | null;
}

const cellBase = 'w-12 h-10 flex items-center justify-center border border-[#1f2937]';

export default function DPTableVisualizer({ table = [[]], rowLabels = [], colLabels = [], highlight = null, includedCells = [], excludedCells = [], selectedItems = null, pseudocodeLine = null, splitTable = null, selectedParenthesization = null }: DPTableVisualizerProps) {
  const rows = table.length;
  const cols = table[0]?.length ?? 0;
  const splitRows = splitTable ? splitTable.length : 0;
  const splitCols = splitTable && splitTable[0] ? splitTable[0].length : 0;

  const includedSet = new Set(includedCells.map(c => `${c.i},${c.j}`));
  const excludedSet = new Set(excludedCells.map(c => `${c.i},${c.j}`));

  const cellClass = (i: number, j: number) => {
    const key = `${i},${j}`;
    let classes = '';
    if (highlight && highlight.i === i && highlight.j === j) {
      switch (highlight.type) {
        case 'include': classes = 'bg-[#00FF99]/40 border-[#00FF99] text-[#00FF99]'; break;
        case 'exclude': classes = 'bg-[#FF6B6B]/30 border-[#FF6B6B] text-[#FF6B6B]'; break;
        case 'compare': classes = 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'; break;
        case 'match': classes = 'bg-[#7CFC00]/30 border-[#7CFC00] text-[#7CFC00]'; break;
        case 'mismatch': classes = 'bg-[#FF9F43]/30 border-[#FF9F43] text-[#FF9F43]'; break;
        case 'current': classes = 'bg-[#FFF59D]/40 border-[#FFD54F] text-[#FFD54F]'; break;
        case 'write': classes = 'bg-[#00F0FF]/30 border-[#00F0FF] text-[#00F0FF] animate-pulse'; break;
        default: classes = 'bg-[#111827]';
      }
    } else if (includedSet.has(key)) {
      classes = 'bg-[#002b1f] border-[#00FF99] text-[#00FF99]';
    } else if (excludedSet.has(key)) {
      classes = 'bg-[#2b0b0b] border-[#FF6B6B] text-[#FF6B6B]';
    } else {
      classes = 'bg-[#071017]';
    }
    return `${cellBase} ${classes}`;
  };

    const displayCell = (cell: any) => {
      if (cell === Infinity) return '∞';
      if (cell === null || typeof cell === 'undefined') return '';
      return String(cell);
    };

  return (
    <div className="space-y-3">
      <div className="overflow-auto rounded-lg border border-[#0b1220]">
        <div className="inline-block">
          <div className="grid" style={{ gridTemplateColumns: `80px repeat(${cols}, 48px)` }}>
            {/* top-left empty */}
            <div className="w-20 h-10 flex items-center justify-center bg-[#061017] border border-[#0b1220] text-sm text-gray-300"> </div>
            {colLabels.map((c, j) => (
              <div key={`col-${j}`} className="w-12 h-10 flex items-center justify-center border border-[#0b1220] text-sm text-[#00F0FF] font-medium">{c}</div>
            ))}

            {table.map((row: number[], i: number) => (
              <React.Fragment key={`row-${i}`}>
                <div className="w-20 h-10 flex items-center justify-center bg-[#061017] border border-[#0b1220] text-sm text-gray-200 font-medium">{rowLabels[i] ?? i}</div>
                {row.map((cell: any, j: number) => (
                  <div key={`cell-${i}-${j}`} className={cellClass(i, j)}>
                    <div className="text-sm font-medium">{displayCell(cell)}</div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {splitTable && (
        <div className="mt-4">
          <div className="text-sm text-gray-300 mb-2">Split Table (k values)</div>
          <div className="overflow-auto rounded-lg border border-[#0b1220]">
            <div className="inline-block">
              <div className="grid" style={{ gridTemplateColumns: `80px repeat(${splitCols}, 48px)` }}>
                <div className="w-20 h-10 flex items-center justify-center bg-[#061017] border border-[#0b1220] text-sm text-gray-300"> </div>
                {Array.from({ length: splitCols }).map((_, j) => (
                  <div key={`scol-${j}`} className="w-12 h-10 flex items-center justify-center border border-[#0b1220] text-sm text-[#00F0FF] font-medium">{j}</div>
                ))}
                {splitTable.map((row, i) => (
                  <React.Fragment key={`srow-${i}`}>
                    <div className="w-20 h-10 flex items-center justify-center bg-[#061017] border border-[#0b1220] text-sm text-gray-200 font-medium">{i}</div>
                    {row.map((cell, j) => (
                      <div key={`scell-${i}-${j}`} className={`${cellBase} bg-[#071017]`}>
                        <div className="text-sm font-medium">{cell === null ? '' : String(cell)}</div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          {selectedParenthesization && (
            <div className="mt-3 text-sm text-gray-200">Optimal Parenthesization: <span className="text-[#39FF14] font-medium">{selectedParenthesization}</span></div>
          )}
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="text-sm text-gray-300">Pseudocode Highlight: <span className="text-[#00F0FF] font-mono">{pseudocodeLine ?? '-'}</span></div>
          {selectedItems && (
            <div className="mt-2 text-sm text-gray-200">Selected items: <span className="text-[#39FF14] font-medium">{selectedItems.join(', ')}</span></div>
          )}
        </div>
        <div className="w-44">
          <div className="text-xs text-gray-400">Legend</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2"><span className="inline-block w-4 h-3 bg-[#00FF99]"/> Included</div>
            <div className="flex items-center gap-2"><span className="inline-block w-4 h-3 bg-[#FF6B6B]"/> Excluded</div>
            <div className="flex items-center gap-2"><span className="inline-block w-4 h-3 bg-[#00F0FF]"/> Comparison / Dependency</div>
            <div className="flex items-center gap-2"><span className="inline-block w-4 h-3 bg-[#FFD54F]"/> Current cell</div>
            <div className="flex items-center gap-2"><span className="inline-block w-4 h-3 bg-[#00F0FF]"/> Write (neon)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
