"use client";

import React, { useEffect, useRef, useState } from "react";
// Lightweight internal force simulation (avoids external d3 dependency)

interface Edge {
  from: string;
  to: string;
  weight?: number;
}

interface GraphNodeType { id: string; x?: number; y?: number }
interface GraphDataProp { nodes: GraphNodeType[]; edges: Edge[]; directed?: boolean }

interface GraphVisualizerProps {
  nodes: string[];
  edges: Edge[];
  // optional centralized graph state (preferred)
  graphState?: GraphDataProp | null;
  // optional setter for centralized state (visualizer may call to update positions)
  setGraphState?: (g: GraphDataProp | null) => void;
  currentNode?: string | null;
  visitedNodes?: string[];
  frontier?: string[]; // queue or stack
  // new interaction helpers
  currentEdge?: { from: string; to: string } | null;
  newlyVisited?: string | null;
  frontierAction?: string | null;
  stackAction?: string | null;
  // weighted/priority helpers
  distances?: Record<string, number | string> | null;
  pq?: { id: string; dist: number }[] | null;
  selectedEdge?: { from: string; to: string } | null;
  rejectedEdge?: { from: string; to: string } | null;
  updatedDistance?: string | null;
  inMSTEdges?: { from: string; to: string }[] | null;
  // Kruskal / Topo / Bellman-Ford helpers
  edgeListSorted?: { from: string; to: string; weight?: number }[] | null;
  acceptedEdges?: { from: string; to: string }[] | null;
  rejectedEdges?: { from: string; to: string }[] | null;
  unionFind?: Record<string, string> | null;
  ufAction?: { type: 'find' | 'union' | 'setParent'; a?: string; b?: string; parent?: string } | null;
  indegrees?: Record<string, number> | null;
  removedEdges?: { from: string; to: string }[] | null;
  negativeCycleEdges?: { from: string; to: string }[] | null;
  affectedNodes?: string[] | null;
  // layout choice: if true, run force-directed simulation; otherwise use circle layout
  useForceLayout?: boolean;
  // directed flag (controls arrowheads)
  directed?: boolean;
}

export default function GraphVisualizer({ nodes = [], edges = [], graphState = null, setGraphState = undefined, currentNode = null, visitedNodes = [], frontier = [], currentEdge = null, newlyVisited = null, frontierAction = null, stackAction = null, distances = null, pq = null, selectedEdge = null, rejectedEdge = null, updatedDistance = null, inMSTEdges = null, edgeListSorted = null, acceptedEdges = null, rejectedEdges = null, unionFind = null, ufAction = null, indegrees = null, removedEdges = null, negativeCycleEdges = null, affectedNodes = null, useForceLayout = false, directed = true }: GraphVisualizerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 360 });

  // keep internal simulation nodes/links state
  const simRef = useRef<number | null>(null);
  const nodesRef = useRef<any[]>([]);
  const linksRef = useRef<any[]>([]);

  // radius for nodes
  const NODE_RADIUS = 22;
  const MARGIN = NODE_RADIUS + 12; // larger margin so labels don't touch edge

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: Math.max(300, rect.width), height: Math.max(240, rect.height - 24) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Initialize nodes and links for simulation or circle layout
  // derive effective nodes/edges from centralized graphState when provided
  const effectiveNodeIds = graphState ? graphState.nodes.map((n) => n.id) : nodes;
  const effectiveEdges = graphState ? graphState.edges : edges;

  useEffect(() => {
    if (graphState) {
      console.log('GraphVisualizer received graphState update:', graphState);
      if (setGraphState) {
        // expose setter presence for debugging
        // (we don't call it automatically here to avoid unexpected writes)
        console.log('GraphVisualizer has access to setGraphState');
      }
    }
    // create link set
    linksRef.current = effectiveEdges.map((e) => ({ source: e.from, target: e.to, weight: e.weight }));

    const { width, height } = dimensions;

    // compute circle layout when not using force-directed layout
    if (!useForceLayout) {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.max(80, Math.min(width, height) / 2 - MARGIN - 20);
      nodesRef.current = effectiveNodeIds.map((id, idx) => {
        const angle = (idx / Math.max(1, effectiveNodeIds.length)) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        return { id, x, y, vx: 0, vy: 0 };
      });
      // no continuous simulation; trigger one render
      setTick((t) => t + 1);
      // stop any running sim
      if (simRef.current) { cancelAnimationFrame(simRef.current); simRef.current = null; }
      return;
    }

    // for force layout: randomize initial positions and start sim loop
    nodesRef.current = effectiveNodeIds.map((id, idx) => ({ id, x: Math.random() * width, y: Math.random() * height, vx: 0, vy: 0 }));

    // stop previous loop
    if (simRef.current) {
      cancelAnimationFrame(simRef.current);
      simRef.current = null;
    }

    let running = true;
    const MAX_ITER = 1000;
    let iter = 0;

    const step = () => {
      iter++;
      const nodesA = nodesRef.current;
      const linksA = linksRef.current;

      // parameters (adaptive to graph density)
      const area = width * height;
      const density = Math.max(0.0001, nodesA.length / area); // nodes per px
      // base values
      const BASE_SPRING_K = 0.03;
      const BASE_SPRING_LENGTH = 110;
      const BASE_REPULSION = 4500;
      const DAMPING = 0.78;

      // adapt spring length and repulsion when graph is dense
      const SPRING_LENGTH = Math.max(60, BASE_SPRING_LENGTH * (1 + Math.min(2.0, density * 8000)));
      const SPRING_K = Math.max(0.005, BASE_SPRING_K / (1 + density * 1500));
      const REPULSION = BASE_REPULSION * (1 + density * 1200);

      // link (spring) forces
      for (const link of linksA) {
        const a = nodesA.find((n) => n.id === link.source);
        const b = nodesA.find((n) => n.id === link.target);
        if (!a || !b) continue;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        const force = SPRING_K * (dist - SPRING_LENGTH);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // repulsion & collision
      for (let i = 0; i < nodesA.length; i++) {
        for (let j = i + 1; j < nodesA.length; j++) {
          const n1 = nodesA[i];
          const n2 = nodesA[j];
          let dx = n2.x - n1.x;
          let dy = n2.y - n1.y;
          let dist2 = dx * dx + dy * dy + 0.01;
          let dist = Math.sqrt(dist2);
          const minDist = NODE_RADIUS * 2 + 10 + Math.min(24, nodesA.length);
          const force = REPULSION / dist2;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;

          if (dist < minDist && dist > 0.001) {
            const overlap = (minDist - dist);
            const nx = dx / dist;
            const ny = dy / dist;
            const push = overlap * 0.5;
            n1.x -= nx * push;
            n1.y -= ny * push;
            n2.x += nx * push;
            n2.y += ny * push;
          }
        }
      }

      // integrate
      for (const n of nodesA) {
        const cx = width / 2;
        const cy = height / 2;
        const centering = 0.001 + Math.min(0.01, 0.0005 * nodesA.length);
        n.vx += (cx - n.x) * centering;
        n.vy += (cy - n.y) * centering;

        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx;
        n.y += n.vy;

        n.x = Math.max(MARGIN, Math.min(width - MARGIN, n.x));
        n.y = Math.max(MARGIN, Math.min(height - MARGIN, n.y));
      }

      setTick((t) => t + 1);
      if (running && iter < MAX_ITER) {
        simRef.current = requestAnimationFrame(step);
      }
    };

    simRef.current = requestAnimationFrame(step);

    return () => {
      running = false;
      if (simRef.current) cancelAnimationFrame(simRef.current);
      simRef.current = null;
    };
  // dependencies include node/edge lists, layout mode and dimensions
  }, [effectiveNodeIds.join("|"), effectiveEdges.map((e) => `${e.from}-${e.to}`).join('|'), dimensions.width, dimensions.height, useForceLayout, graphState]);

  // small state used to trigger re-renders on simulation ticks
  const [tickCount, setTick] = useState(0);
  const [ufPopups, setUfPopups] = useState<Array<{ id: string; x: number; y: number; text: string; key: string }>>([]);
  const [recentUnion, setRecentUnion] = useState<string[]>([]);
  // playback controls
  const speedRef = useRef(1);
  const isPlayingRef = useRef(true);
  const [hovered, setHovered] = useState<{ id: string | null; x: number; y: number }>({ id: null, x: 0, y: 0 });

  // setup zoom & pan
  useEffect(() => {
    // Lightweight zoom & pan implementation without d3
    const svgEl = svgRef.current;
    const gEl = gRef.current;
    if (!svgEl || !gEl) return;
    // store transform in refs for autoFit
    const scaleRef = (gRef as any).scaleRef ?? { current: 1 };
    (gRef as any).scaleRef = scaleRef;
    const translateRef = (gRef as any).translateRef ?? { current: { x: 0, y: 0 } };
    (gRef as any).translateRef = translateRef;
    let isPanning = false;
    let startX = 0;
    let startY = 0;

    const applyTransform = () => {
      const s = (gRef as any).scaleRef.current;
      const t = (gRef as any).translateRef.current;
      gEl.setAttribute('transform', `translate(${t.x}, ${t.y}) scale(${s})`);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const s = Math.min(3, Math.max(0.35, (gRef as any).scaleRef.current + delta));
      // zoom toward cursor
      const rect = svgEl.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const factor = s / (gRef as any).scaleRef.current;
      (gRef as any).translateRef.current.x = cx - factor * (cx - (gRef as any).translateRef.current.x);
      (gRef as any).translateRef.current.y = cy - factor * (cy - (gRef as any).translateRef.current.y);
      (gRef as any).scaleRef.current = s;
      applyTransform();
    };

    const onPointerDown = (e: PointerEvent) => {
      isPanning = true;
      startX = e.clientX - (gRef as any).translateRef.current.x;
      startY = e.clientY - (gRef as any).translateRef.current.y;
      try { (svgEl as Element).setPointerCapture(e.pointerId); } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanning) return;
      (gRef as any).translateRef.current.x = e.clientX - startX;
      (gRef as any).translateRef.current.y = e.clientY - startY;
      applyTransform();
    };

    const onPointerUp = (e: PointerEvent) => {
      isPanning = false;
      try { (svgEl as Element).releasePointerCapture(e.pointerId); } catch {}
    };

    svgEl.addEventListener('wheel', onWheel, { passive: false });
    svgEl.addEventListener('pointerdown', onPointerDown as any);
    window.addEventListener('pointermove', onPointerMove as any);
    window.addEventListener('pointerup', onPointerUp as any);

    // initial transform
    (gRef as any).translateRef.current = { x: 0, y: 0 };
    (gRef as any).scaleRef.current = 1;
    applyTransform();

    return () => {
      svgEl.removeEventListener('wheel', onWheel as any);
      svgEl.removeEventListener('pointerdown', onPointerDown as any);
      window.removeEventListener('pointermove', onPointerMove as any);
      window.removeEventListener('pointerup', onPointerUp as any);
    };
  }, [effectiveNodeIds.join("|"), effectiveEdges.length]);

  // auto-fit: center and scale to fit nodes into view
  const autoFit = () => {
    const gEl = gRef.current;
    const svgEl = svgRef.current;
    if (!gEl || !svgEl) return;
    const padding = 80;
    const xs = nodesRef.current.map((n) => n.x);
    const ys = nodesRef.current.map((n) => n.y);
    if (xs.length === 0) return;
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const graphW = Math.max(1, maxX - minX);
    const graphH = Math.max(1, maxY - minY);
    const viewW = dimensions.width - padding;
    const viewH = dimensions.height - padding;
    const scale = Math.min(viewW / graphW, viewH / graphH, 1.6);
    const tx = (dimensions.width / 2) - ((minX + maxX) / 2) * scale;
    const ty = (dimensions.height / 2) - ((minY + maxY) / 2) * scale;
    (gRef as any).scaleRef = (gRef as any).scaleRef ?? { current: 1 };
    (gRef as any).translateRef = (gRef as any).translateRef ?? { current: { x: 0, y: 0 } };
    (gRef as any).scaleRef.current = scale;
    (gRef as any).translateRef.current = { x: tx, y: ty };
    gEl.setAttribute('transform', `translate(${tx}, ${ty}) scale(${scale})`);
  };

  useEffect(() => {
    // run autofit after nodes settle
    const id = setTimeout(() => autoFit(), 140);
    return () => clearTimeout(id);
  }, [tickCount, dimensions.width, dimensions.height]);


  // helper to find node position
  const findPos = (id: string) => {
    const n = nodesRef.current.find((x) => x.id === id);
    return n ? { x: n.x ?? dimensions.width / 2, y: n.y ?? dimensions.height / 2 } : { x: dimensions.width / 2, y: dimensions.height / 2 };
  };

  // convert screen/client coordinates to graph coordinates (account for pan/zoom)
  const clientToGraph = (clientX: number, clientY: number) => {
    const svgEl = svgRef.current;
    if (!svgEl) return { x: clientX, y: clientY };
    const rect = svgEl.getBoundingClientRect();
    const tx = (gRef as any).translateRef?.current?.x ?? 0;
    const ty = (gRef as any).translateRef?.current?.y ?? 0;
    const s = (gRef as any).scaleRef?.current ?? 1;
    const gx = (clientX - rect.left - tx) / s;
    const gy = (clientY - rect.top - ty) / s;
    return { x: gx, y: gy };
  };

  // Editor APIs and helpers removed; visualizer is declarative now

  // show small transient popups for union-find actions
  useEffect(() => {
    if (!ufAction) return;
    const now = Date.now();
    const popups: Array<{ id: string; x: number; y: number; text: string; key: string }> = [];

    if (ufAction.type === 'union' && ufAction.a && ufAction.b) {
      const pa = findPos(ufAction.a);
      const pb = findPos(ufAction.b);
      popups.push({ id: ufAction.a, x: pa.x, y: pa.y - NODE_RADIUS - 28, text: `parent ${ufAction.a}→${ufAction.b}`, key: `uf-${ufAction.a}-${now}` });
      popups.push({ id: ufAction.b, x: pb.x, y: pb.y - NODE_RADIUS - 28, text: `parent ${ufAction.b}→${ufAction.a}`, key: `uf-${ufAction.b}-${now}` });
      // highlight both nodes briefly
      setRecentUnion((r) => [...r, ufAction.a!, ufAction.b!]);
    } else if (ufAction.type === 'find' && ufAction.a && ufAction.b) {
      const pa = findPos(ufAction.a);
      popups.push({ id: ufAction.a, x: pa.x, y: pa.y - NODE_RADIUS - 28, text: `find(${ufAction.a},${ufAction.b})`, key: `uf-find-${ufAction.a}-${now}` });
    } else if (ufAction.type === 'setParent' && ufAction.a && ufAction.parent) {
      const pa = findPos(ufAction.a);
      popups.push({ id: ufAction.a, x: pa.x, y: pa.y - NODE_RADIUS - 28, text: `parent ${ufAction.a}→${ufAction.parent}`, key: `uf-set-${ufAction.a}-${now}` });
      setRecentUnion((r) => [...r, ufAction.a!]);
    }

    if (popups.length > 0) {
      setUfPopups((cur) => [...cur, ...popups]);
      const t = window.setTimeout(() => {
        setUfPopups((cur) => cur.filter((p) => !popups.find((q) => q.key === p.key)));
        // clear recentUnion after same duration
        setTimeout(() => setRecentUnion((r) => r.slice(popups.length)), 600);
      }, 600);
      return () => window.clearTimeout(t);
    }
  }, [ufAction]);

  // colors
  const colorFor = (id: string) => {
    if (currentNode && id === currentNode) return '#FF10F0';
    if (visitedNodes && visitedNodes.includes(id)) return '#39FF14';
    if (frontier && frontier.includes(id)) return '#00F0FF';
    return '#00F0FF';
  };

  const edgeStatus = (link: any) => {
    const from = link.source?.id ?? link.source;
    const to = link.target?.id ?? link.target;
    if (currentEdge && currentEdge.from === from && currentEdge.to === to) return 'current';
    if (negativeCycleEdges && negativeCycleEdges.find(e => e.from === from && e.to === to)) return 'negative';
    if (selectedEdge && selectedEdge.from === from && selectedEdge.to === to) return 'selected';
    if (rejectedEdge && rejectedEdge.from === from && rejectedEdge.to === to) return 'rejected';
    if (acceptedEdges && acceptedEdges.find(e => e.from === from && e.to === to)) return 'accepted';
    if (rejectedEdges && rejectedEdges.find(e => e.from === from && e.to === to)) return 'rejected';
    if (frontier && (frontier.includes(from) || frontier.includes(to))) return 'frontier';
    if (inMSTEdges && inMSTEdges.find(e => e.from === from && e.to === to)) return 'inmst';
    if (visitedNodes && visitedNodes.includes(from) && visitedNodes.includes(to)) return 'visited';
    return 'normal';
  };

  return (
    <div ref={containerRef} className="relative w-full h-96 p-2 rounded-lg glass-card border border-[#39FF14]/20">
      <style>{`
        @keyframes ring {
          from { transform: scale(0.6); opacity: 0.9; }
          to { transform: scale(2.2); opacity: 0; }
        }
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}</style>

      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Arrowheads for different statuses */}
          <marker id="arrow-normal" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L10,5 L0,10 z" fill="#00F0FF" />
          </marker>
          <marker id="arrow-current" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L12,6 L0,12 z" fill="#FF10F0" />
          </marker>
          <marker id="arrow-frontier" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L10,5 L0,10 z" fill="#00F0FF" />
          </marker>
          <marker id="arrow-visited" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L10,5 L0,10 z" fill="#39FF14" />
          </marker>
        </defs>

        <g ref={gRef}>
          {/* links as paths so we can animate along them */}
          {linksRef.current.map((link, i) => {
            const from = link.source?.id ?? link.source;
            const to = link.target?.id ?? link.target;
            const a = findPos(from);
            const b = findPos(to);
            // compute direction and offset endpoints to avoid drawing over node centers
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let dist = Math.hypot(dx, dy) || 1;
            const nx = dx / dist;
            const ny = dy / dist;
            const edgeGap = 6; // gap from node boundary
            const startOffset = NODE_RADIUS + edgeGap;
            const endOffset = NODE_RADIUS + edgeGap;
            // parallel edge offset: count edges between the same unordered pair
            const pairKey = [from, to].sort().join('||');
            const samePair = linksRef.current.filter((L:any) => {
              const A = (L.source?.id ?? L.source);
              const B = (L.target?.id ?? L.target);
              return [A,B].sort().join('||') === pairKey;
            });
            const parallelIndex = samePair.findIndex((s:any) => (s.source?.id ?? s.source) === (link.source?.id ?? link.source) && (s.target?.id ?? s.target) === (link.target?.id ?? link.target));
            const parallelCount = samePair.length;
            // perpendicular unit vector
            const px = -ny;
            const py = nx;
            const parallelOffsetAmt = parallelCount > 1 ? (parallelIndex - (parallelCount - 1) / 2) * 10 : 0;
            const aOff = { x: a.x + nx * startOffset + px * parallelOffsetAmt, y: a.y + ny * startOffset + py * parallelOffsetAmt };
            const bOff = { x: b.x - nx * endOffset + px * parallelOffsetAmt, y: b.y - ny * endOffset + py * parallelOffsetAmt };
            const d = `M ${aOff.x} ${aOff.y} L ${bOff.x} ${bOff.y}`;
            const status = edgeStatus(link);
            const stroke = status === 'current' ? '#FF10F0' : status === 'accepted' ? '#39FF14' : status === 'rejected' ? '#FF3B3B' : status === 'negative' ? '#FF3B3B' : status === 'selected' ? '#39FF14' : status === 'frontier' ? '#00F0FF' : status === 'inmst' ? '#39FF14' : status === 'visited' ? '#39FF14' : '#00F0FF';
            const markerId = status === 'current' ? 'arrow-current' : status === 'accepted' ? 'arrow-visited' : status === 'rejected' ? 'arrow-normal' : status === 'negative' ? 'arrow-normal' : status === 'selected' ? 'arrow-visited' : status === 'frontier' ? 'arrow-frontier' : status === 'inmst' ? 'arrow-visited' : status === 'visited' ? 'arrow-visited' : 'arrow-normal';

            // mid point for weight label (slightly offset perpendicular to avoid overlapping the edge)
            const mx = (aOff.x + bOff.x) / 2 + px * 10;
            const my = (aOff.y + bOff.y) / 2 + py * 10;

            const isRemoved = removedEdges && removedEdges.find((re:any) => re.from === from && re.to === to);
            return (
              <g key={`link-${i}`}>
                <path id={`edgepath-${i}`} d={d} stroke={stroke} strokeWidth={status === 'rejected' ? 2 : status === 'accepted' ? 4 : status === 'selected' ? 4 : 3} strokeLinecap="round" strokeLinejoin="round" fill="none" markerEnd={directed ? `url(#${markerId})` : undefined} style={{ filter: 'url(#glow)', opacity: isRemoved ? 0.18 : 0.98, strokeDasharray: status === 'rejected' ? '6 4' : isRemoved ? '4 4' : undefined }} />

                {/* moving pulse/arrow when this is the current traversal edge */}
                {currentEdge && currentEdge.from === from && currentEdge.to === to && (
                  <g key={`pulse-${i}`}>
                    <circle r={6} fill="#FF10F0" style={{ filter: 'url(#glow)' }}>
                      {/* animate along the path once per step; key tied to tickCount ensures restart */}
                      <animateMotion dur="0.45s" fill="freeze">
                        <mpath xlinkHref={`#edgepath-${i}`} />
                      </animateMotion>
                    </circle>
                  </g>
                )}

                {/* show edge weight if present */}
                {link.weight !== undefined && (
                  <g transform={`translate(${mx}, ${my})`}>
                    <rect x={-14} y={-12} width={28} height={20} rx={6} fill={currentEdge && currentEdge.from === from && currentEdge.to === to ? '#111' : '#000'} opacity={0.78} style={currentEdge && currentEdge.from === from && currentEdge.to === to ? { filter: 'url(#glow)', transformOrigin: 'center', animation: 'ring 500ms ease-out' } : {}} />
                    <text x={0} y={4} textAnchor="middle" fontSize={12} fill="#fff">{link.weight}</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* edge draft while adding an edge */}
          {/* no in-canvas edge draft: graph is built via the Custom Graph Builder form */}

          {/* compute label positions to avoid overlaps (simple relaxation) */}
          {(() => {
            const labelPositions: { id: string; x: number; y: number; w: number; h: number }[] = nodesRef.current.map((n) => {
              const px = n.x ?? dimensions.width / 2;
              const py = n.y ?? dimensions.height / 2;
              // label width estimate and default above offset
              return { id: n.id, x: px, y: py - NODE_RADIUS - 18, w: 44, h: 18 };
            });

            // iterative relax to remove overlaps
            for (let iter = 0; iter < 6; iter++) {
              for (let i = 0; i < labelPositions.length; i++) {
                for (let j = i + 1; j < labelPositions.length; j++) {
                  const a = labelPositions[i];
                  const b = labelPositions[j];
                  const dx = b.x - a.x;
                  const dy = b.y - a.y;
                  const overlapX = (a.w + b.w) / 2 - Math.abs(dx);
                  const overlapY = (a.h + b.h) / 2 - Math.abs(dy);
                  if (overlapX > 0 && overlapY > 0) {
                    // push them vertically apart
                    const push = (overlapY / 2) + 2;
                    if (a.y <= b.y) {
                      a.y -= push;
                      b.y += push;
                    } else {
                      a.y += push;
                      b.y -= push;
                    }
                    // clamp to top/bottom margins
                    a.y = Math.max(NODE_RADIUS + 6, Math.min(dimensions.height - NODE_RADIUS - 6, a.y));
                    b.y = Math.max(NODE_RADIUS + 6, Math.min(dimensions.height - NODE_RADIUS - 6, b.y));
                  }
                }
              }
            }

            return nodesRef.current.map((n) => {
              const pos = { x: n.x ?? dimensions.width / 2, y: n.y ?? dimensions.height / 2 };
              const lbl = labelPositions.find((l) => l.id === n.id) || { x: pos.x, y: pos.y - NODE_RADIUS - 18 };
              const fill = colorFor(n.id);
              const stroke = fill;
              const isCurrent = currentNode && n.id === currentNode;
              const isNew = newlyVisited && n.id === newlyVisited;
              const dist = distances && distances[n.id] !== undefined ? distances[n.id] : null;
              const indegVal = indegrees && indegrees[n.id] !== undefined ? indegrees[n.id] : null;
              const isUpdated = updatedDistance && updatedDistance === n.id;
              return (
                <g key={`node-${n.id}`} transform={`translate(${pos.x}, ${pos.y})`} style={{ transition: 'transform 200ms' }}>
                  {/* expanding ring for newly visited */}
                  {isNew && (
                    <circle r={NODE_RADIUS + 6} fill="none" stroke="#39FF14" strokeWidth={2} style={{ filter: 'url(#glow)', opacity: 0.9, animation: 'ring 700ms ease-out' }} />
                  )}

                  {/* dashed outline for the active exploration node */}
                  {isCurrent && (
                    <circle r={NODE_RADIUS + 8} fill="none" stroke="#FF10F0" strokeWidth={2} strokeDasharray="6 6" style={{ filter: 'url(#glow)', animation: 'dash 1000ms linear infinite' }} />
                  )}

                  <circle r={NODE_RADIUS} fill={fill} stroke={stroke} strokeWidth={3} style={{ filter: 'url(#glow)', transition: 'fill 200ms, stroke 200ms' }} />
                  <text x={0} y={6} textAnchor="middle" fontSize={12} fill="#000" style={{ fontWeight: 700 }}>{n.id}</text>

                  {/* distance / indegree label positioned with collision avoidance */}
                  <g transform={`translate(${lbl.x - pos.x}, ${lbl.y - pos.y})`}>
                    <rect x={-22} y={-12} width={44} height={20} rx={6} fill={isUpdated ? '#111' : '#000'} opacity={0.8} style={isUpdated ? { filter: 'url(#glow)', animation: 'ring 500ms ease-out' } : {}} />
                    <text x={0} y={2} textAnchor="middle" fontSize={12} fill="#fff">{indegVal !== null ? String(indegVal) : dist === null ? '∞' : (dist === Infinity ? '∞' : String(dist))}</text>
                  </g>
                </g>
              );
            });
          })()}
        </g>
      </svg>

      {/* Toolbar moved to parent Custom Input panel */}

      {/* weight modal removed — graph weights are provided by the Custom Graph Builder form */}

      {/* UF popups (transient) */}
      {ufPopups.map((p) => (
        <div key={p.key} className="absolute pointer-events-none" style={{ left: `${p.x}px`, top: `${p.y}px`, transform: 'translate(-50%, -100%)' }}>
          <div className="px-2 py-1 bg-[#111111dd] text-xs text-white rounded-md border border-[#39FF14]/30 neon-glow-green" style={{ filter: 'url(#glow)' }}>
            {p.text}
          </div>
        </div>
      ))}

      {/* recent union highlight rings */}
      {recentUnion.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} preserveAspectRatio="xMidYMid meet">
            <g>
              {nodesRef.current.filter(n => recentUnion.includes(n.id)).map((n, idx) => (
                <circle key={`union-ring-${n.id}-${idx}`} cx={n.x} cy={n.y} r={NODE_RADIUS + 10} fill="none" stroke="#39FF14" strokeWidth={3} style={{ filter: 'url(#glow)', opacity: 0.9, transition: 'opacity 500ms' }} />
              ))}
            </g>
          </svg>
        </div>
      )}

      {/* edge-list / union-find overlay (left) */}
      {edgeListSorted && edgeListSorted.length > 0 && (
        <div className="absolute top-3 left-3 bg-[#000000cc] text-sm text-gray-200 p-2 rounded-md border border-[#00F0FF]/20 max-h-80 overflow-auto">
          <div className="text-xs text-gray-300 mb-2">Edges (sorted)</div>
          {edgeListSorted.map((e, idx) => {
            const isCurrent = currentEdge && currentEdge.from === e.from && currentEdge.to === e.to;
            const isAccepted = acceptedEdges && acceptedEdges.find(a => a.from === e.from && a.to === e.to);
            const isRejected = rejectedEdges && rejectedEdges.find(r => r.from === e.from && r.to === e.to);
            return (
              <div key={`el-${idx}`} className={`flex items-center justify-between px-2 py-1 my-0.5 rounded ${isCurrent ? 'bg-[#111]' : 'bg-transparent'}`}>
                <div className={`text-xs ${isAccepted ? 'text-[#39FF14]' : isRejected ? 'text-[#FF6B6B]' : 'text-gray-200'}`}>{e.from} → {e.to}</div>
                <div className={`text-xs ml-2 ${isAccepted ? 'text-[#39FF14]' : isRejected ? 'text-[#FF6B6B]' : 'text-gray-200'}`}>{e.weight}</div>
              </div>
            );
          })}

          {/* union-find state */}
          {unionFind && (
            <div className="mt-2 text-xs text-gray-300">
              <div className="font-semibold text-xs text-gray-200 mb-1">Union-Find</div>
              <div className="text-xs">
                {Object.entries(unionFind).map(([k,v]) => (
                  <div key={`uf-${k}`} className="flex justify-between text-xs">
                    <span className="text-gray-200">{k}</span>
                    <span className="text-gray-400">→ {v}</span>
                  </div>
                ))}
              </div>
              {ufAction && (
                <div className="mt-1 text-xs text-[#00F0FF]">{ufAction.type} {ufAction.a}{ufAction.b ? `, ${ufAction.b}` : ''}{ufAction.parent ? ` → ${ufAction.parent}` : ''}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* stack/queue overlay (top-right) */}
      <div className="absolute top-3 right-3 bg-[#000000aa] text-sm text-gray-200 p-2 rounded-md border border-[#00F0FF]/20">
        {stackAction && (
          <div className="mb-1">
            <strong className="text-[#FF10F0] mr-2">Stack:</strong>
            <span className="text-gray-300">{stackAction}</span>
          </div>
        )}
        {frontierAction && (
          <div className="mb-1">
            <strong className="text-[#00F0FF] mr-2">Queue:</strong>
            <span className="text-gray-300">{frontierAction}</span>
          </div>
        )}

        {/* Priority queue view */}
        {pq && pq.length > 0 ? (
          <div className="mb-1">
            <strong className="text-[#00F0FF] mr-2">PQ</strong>
            <div className="flex gap-2 flex-wrap">
              {pq.slice().sort((a,b)=>a.dist-b.dist).map((p) => (
                <div key={`p-${p.id}`} className="px-2 py-1 bg-[#0b0b10] border border-[#00F0FF]/20 rounded text-xs">
                  {p.id}:{p.dist}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {(frontier || []).map((id) => (
              <div key={`f-${id}`} className="px-2 py-1 bg-[#0b0b10] border border-[#00F0FF]/20 rounded text-xs">
                {id}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-3 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#FF10F0] neon-glow-pink inline-block rounded-full" />
          Current
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#39FF14] neon-glow-green inline-block rounded-full" />
          Visited
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#00F0FF] neon-glow-blue inline-block rounded-full" />
          Frontier
        </div>
      </div>
    </div>
  );
}
