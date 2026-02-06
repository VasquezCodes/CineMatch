"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "@/components/CloudinaryImage";
import Link from "next/link";
import { Star, Sparkles, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConstellationData, ConstellationNode, ConstellationEdge } from "../types/constellationTypes";

interface ConstellationMapProps {
    data: ConstellationData;
}

// Genre/Cluster color palette
const CLUSTER_COLORS: Record<string, string> = {
    // Default colors for common genres/clusters
    "accion": "#ef4444",      // red
    "action": "#ef4444",
    "comedia": "#f59e0b",     // amber
    "comedy": "#f59e0b",
    "drama": "#8b5cf6",       // violet
    "terror": "#064e3b",      // emerald dark
    "horror": "#064e3b",
    "sci-fi": "#06b6d4",      // cyan
    "ciencia ficcion": "#06b6d4",
    "romance": "#ec4899",     // pink
    "thriller": "#f97316",    // orange
    "suspenso": "#f97316",
    "aventura": "#22c55e",    // green
    "adventure": "#22c55e",
    "animacion": "#a855f7",   // purple
    "animation": "#a855f7",
    "documental": "#64748b",  // slate
    "documentary": "#64748b",
    "fantasia": "#14b8a6",    // teal
    "fantasy": "#14b8a6",
};

// Fallback colors for unknown clusters (cycle through)
const FALLBACK_COLORS = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
];

function getClusterColor(cluster: string | null | undefined, index: number): string {
    if (!cluster) return FALLBACK_COLORS[index % FALLBACK_COLORS.length];

    const normalized = cluster.toLowerCase().trim();
    if (CLUSTER_COLORS[normalized]) return CLUSTER_COLORS[normalized];

    // Check partial matches
    for (const [key, color] of Object.entries(CLUSTER_COLORS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return color;
        }
    }

    return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

// Neural Network Node Component
function NeuralNode({
    node,
    x,
    y,
    size,
    color,
    isHovered,
    isConnected,
    isDimmed,
    onHover,
    onClick,
}: {
    node: ConstellationNode;
    x: number;
    y: number;
    size: number;
    color: string;
    isHovered: boolean;
    isConnected: boolean;
    isDimmed: boolean;
    onHover: (id: string | null) => void;
    onClick: (node: ConstellationNode) => void;
}) {
    const isSource = node.type === 'source';

    return (
        <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: isDimmed ? 0.2 : 1,
                scale: isHovered ? 1.12 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onMouseEnter={() => onHover(node.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(node)}
            className="cursor-pointer"
            style={{ transformOrigin: `${x}px ${y}px` }}
        >
            {/* Glow effect for hovered/connected nodes */}
            {(isHovered || isConnected) && (
                <circle
                    cx={x}
                    cy={y}
                    r={size + 8}
                    fill="none"
                    stroke={color}
                    strokeWidth={3}
                    strokeOpacity={0.5}
                />
            )}

            {/* Main circle with colored border */}
            <circle
                cx={x}
                cy={y}
                r={size}
                fill="hsl(var(--background))"
                stroke={color}
                strokeWidth={isHovered ? 4 : isSource ? 3 : 2.5}
            />

            {/* Clip path for poster */}
            <clipPath id={`clip-${node.id}`}>
                <circle cx={x} cy={y} r={size - 3} />
            </clipPath>

            {/* Poster image */}
            {node.movie.posterUrl && (
                <image
                    href={node.movie.posterUrl}
                    x={x - size + 3}
                    y={y - size + 3}
                    width={(size - 3) * 2}
                    height={(size - 3) * 2}
                    clipPath={`url(#clip-${node.id})`}
                    preserveAspectRatio="xMidYMid slice"
                />
            )}

            {/* Score badge */}
            <g transform={`translate(${x + size * 0.65}, ${y - size * 0.65})`}>
                <circle
                    r={12}
                    fill={isSource ? "hsl(var(--primary))" : color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                />
                <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={9}
                    fontWeight={700}
                >
                    {isSource ? node.rating : `${Math.round(node.score || 0)}%`}
                </text>
            </g>

            {/* Title label below node */}
            <text
                x={x}
                y={y + size + 16}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize={11}
                fontWeight={500}
                opacity={isHovered ? 1 : 0.7}
            >
                {node.movie.title.length > 14
                    ? node.movie.title.slice(0, 12) + '...'
                    : node.movie.title}
            </text>
        </motion.g>
    );
}

// Curved connection line
function NeuralEdge({
    x1, y1, x2, y2,
    isActive,
    color,
    strength,
    delay,
}: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    isActive: boolean;
    color: string;
    strength: number;
    delay: number;
}) {
    // Create smooth bezier curve
    const midX = (x1 + x2) / 2;
    const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

    return (
        <motion.path
            d={path}
            fill="none"
            stroke={isActive ? color : "hsl(var(--border))"}
            strokeWidth={isActive ? 3 : 1.5 + strength}
            strokeOpacity={isActive ? 0.8 : 0.15 + strength * 0.2}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay }}
        />
    );
}

export function ConstellationMap({ data }: ConstellationMapProps) {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(null);

    // INCREASED dimensions for more spacing
    const width = 1100;
    const height = 700;
    const padding = 100;
    const sourceX = padding + 60;
    const recX = width - padding - 60;

    // Separate nodes by type
    const sourceNodes = data.nodes.filter(n => n.type === 'source');
    const recNodes = data.nodes.filter(n => n.type === 'recommendation');

    // Limit nodes to prevent overcrowding
    const limitedSourceNodes = sourceNodes.slice(0, 4);
    const limitedRecNodes = recNodes.slice(0, 10);

    // Calculate positions with MORE SPACING
    const positions = useMemo(() => {
        const pos: Record<string, { x: number; y: number; size: number; color: string }> = {};

        // Position source nodes on the left with generous spacing
        const sourceSpacing = (height - padding * 2) / (limitedSourceNodes.length + 1);
        limitedSourceNodes.forEach((node, i) => {
            pos[node.id] = {
                x: sourceX,
                y: padding + sourceSpacing * (i + 1),
                size: 50, // Larger source nodes
                color: "hsl(var(--primary))",
            };
        });

        // Position recommendation nodes on the right with generous spacing
        const recSpacing = (height - padding * 2) / (limitedRecNodes.length + 1);
        limitedRecNodes.forEach((node, i) => {
            pos[node.id] = {
                x: recX,
                y: padding + recSpacing * (i + 1),
                size: 40,
                color: getClusterColor(node.movie.cluster, i),
            };
        });

        return pos;
    }, [limitedSourceNodes, limitedRecNodes]);

    // Filter edges to only include visible nodes
    const visibleEdges = useMemo(() => {
        const visibleNodeIds = new Set([
            ...limitedSourceNodes.map(n => n.id),
            ...limitedRecNodes.map(n => n.id)
        ]);
        return data.edges.filter(e =>
            visibleNodeIds.has(e.sourceId) && visibleNodeIds.has(e.targetId)
        );
    }, [data.edges, limitedSourceNodes, limitedRecNodes]);

    // Find connected nodes when hovering
    const { connectedNodeIds, connectedEdgeIds } = useMemo(() => {
        const nodeIds = new Set<string>();
        const edgeIds = new Set<string>();

        if (hoveredNode) {
            nodeIds.add(hoveredNode);
            visibleEdges.forEach(edge => {
                if (edge.sourceId === hoveredNode) {
                    nodeIds.add(edge.targetId);
                    edgeIds.add(edge.id);
                }
                if (edge.targetId === hoveredNode) {
                    nodeIds.add(edge.sourceId);
                    edgeIds.add(edge.id);
                }
            });
        }

        return { connectedNodeIds: nodeIds, connectedEdgeIds: edgeIds };
    }, [hoveredNode, visibleEdges]);

    // Get unique clusters for legend
    const clusters = useMemo(() => {
        const seen = new Map<string, string>();
        limitedRecNodes.forEach((node, i) => {
            const cluster = node.movie.cluster || 'Otro';
            if (!seen.has(cluster)) {
                seen.set(cluster, getClusterColor(node.movie.cluster, i));
            }
        });
        return Array.from(seen.entries()).slice(0, 5);
    }, [limitedRecNodes]);

    if (limitedSourceNodes.length === 0) {
        return (
            <div className="text-center py-16">
                <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Califica películas con 4-5 estrellas para ver el mapa.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-primary ring-2 ring-primary/30" />
                    <span className="text-muted-foreground">Tus favoritas</span>
                </div>
                {clusters.map(([name, color]) => (
                    <div key={name} className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded-full ring-2"
                            style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${color}30` }}
                        />
                        <span className="text-muted-foreground capitalize">{name}</span>
                    </div>
                ))}
            </div>

            {/* SVG Canvas */}
            <div className="overflow-x-auto pb-4">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full max-w-5xl mx-auto"
                    style={{ minWidth: 700 }}
                >
                    {/* Edges (connections) */}
                    <g className="edges">
                        {visibleEdges.map((edge, i) => {
                            const source = positions[edge.sourceId];
                            const target = positions[edge.targetId];
                            if (!source || !target) return null;

                            const isActive = connectedEdgeIds.has(edge.id);

                            return (
                                <NeuralEdge
                                    key={edge.id}
                                    x1={source.x}
                                    y1={source.y}
                                    x2={target.x}
                                    y2={target.y}
                                    isActive={isActive}
                                    color={target.color}
                                    strength={edge.strength}
                                    delay={0.1 + i * 0.03}
                                />
                            );
                        })}
                    </g>

                    {/* Nodes */}
                    <g className="nodes">
                        {[...limitedSourceNodes, ...limitedRecNodes].map((node) => {
                            const pos = positions[node.id];
                            if (!pos) return null;

                            const isHovered = hoveredNode === node.id;
                            const isConnected = connectedNodeIds.has(node.id);
                            const isDimmed = hoveredNode !== null && !isConnected;

                            return (
                                <NeuralNode
                                    key={node.id}
                                    node={node}
                                    x={pos.x}
                                    y={pos.y}
                                    size={pos.size}
                                    color={pos.color}
                                    isHovered={isHovered}
                                    isConnected={isConnected}
                                    isDimmed={isDimmed}
                                    onHover={setHoveredNode}
                                    onClick={setSelectedNode}
                                />
                            );
                        })}
                    </g>
                </svg>
            </div>

            {/* Hover Tooltip */}
            <AnimatePresence>
                {hoveredNode && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-border rounded-xl px-5 py-3 shadow-2xl max-w-sm z-50"
                    >
                        {(() => {
                            const node = data.nodes.find(n => n.id === hoveredNode);
                            if (!node) return null;
                            const edge = data.edges.find(e => e.targetId === node.id);
                            return (
                                <div className="text-center">
                                    <p className="font-semibold text-foreground text-base">{node.movie.title}</p>
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-1">
                                        {node.movie.year && <span>{node.movie.year}</span>}
                                        {node.movie.cluster && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                <span className="capitalize">{node.movie.cluster}</span>
                                            </>
                                        )}
                                    </div>
                                    {edge && node.type === 'recommendation' && (
                                        <p className="text-xs text-primary mt-2 border-t border-border/50 pt-2">
                                            {edge.reason}
                                        </p>
                                    )}
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selected Node Modal */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedNode(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex gap-4">
                                <div className="relative w-24 h-36 rounded-lg overflow-hidden shrink-0 bg-muted">
                                    {selectedNode.movie.posterUrl ? (
                                        <Image
                                            src={selectedNode.movie.posterUrl}
                                            alt={selectedNode.movie.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Film className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-foreground line-clamp-2">
                                        {selectedNode.movie.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        {selectedNode.movie.year && <span>{selectedNode.movie.year}</span>}
                                        {selectedNode.movie.cluster && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                <span className="capitalize">{selectedNode.movie.cluster}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-3">
                                        {selectedNode.type === 'source' ? (
                                            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                                                <Star className="w-4 h-4 fill-current" />
                                                Tu rating: {selectedNode.rating}/5
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full text-sm font-medium">
                                                <Sparkles className="w-4 h-4" />
                                                {Math.round(selectedNode.score || 0)}% match
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedNode.type === 'recommendation' && (() => {
                                const edge = data.edges.find(e => e.targetId === selectedNode.id);
                                return edge ? (
                                    <div className="mt-5 pt-4 border-t border-border">
                                        <p className="text-sm text-muted-foreground">
                                            <span className="text-foreground font-medium">¿Por qué?</span> {edge.reason}
                                        </p>
                                    </div>
                                ) : null;
                            })()}

                            <div className="mt-6 flex gap-3">
                                <Link
                                    href={`/app/movies/${selectedNode.movie.id}`}
                                    className="flex-1 text-center bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Ver Detalles
                                </Link>
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hint */}
            <p className="text-center text-xs text-muted-foreground mt-4">
                Pasa el cursor sobre cualquier nodo para ver detalles • Haz clic para abrir
            </p>
        </div>
    );
}
