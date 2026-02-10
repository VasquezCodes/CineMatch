"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "@/components/CloudinaryImage";
import Link from "next/link";
import { Star, Sparkles, Film, X, Plus, ExternalLink, Clapperboard, Tag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConstellationData, ConstellationNode, ConstellationEdge } from "../types/constellationTypes";

interface ConstellationMapProps {
    data: ConstellationData;
}

// Genre/Cluster color palette - vibrant colors from Stitch design
const CLUSTER_COLORS: Record<string, { bg: string; ring: string; glow: string }> = {
    "accion": { bg: "#dc2626", ring: "#ef4444", glow: "rgba(239,68,68,0.4)" },
    "action": { bg: "#dc2626", ring: "#ef4444", glow: "rgba(239,68,68,0.4)" },
    "comedia": { bg: "#d97706", ring: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
    "comedy": { bg: "#d97706", ring: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
    "drama": { bg: "#7c3aed", ring: "#8b5cf6", glow: "rgba(139,92,246,0.4)" },
    "terror": { bg: "#065f46", ring: "#10b981", glow: "rgba(16,185,129,0.4)" },
    "horror": { bg: "#065f46", ring: "#10b981", glow: "rgba(16,185,129,0.4)" },
    "sci-fi": { bg: "#0891b2", ring: "#06b6d4", glow: "rgba(6,182,212,0.4)" },
    "ciencia ficcion": { bg: "#0891b2", ring: "#06b6d4", glow: "rgba(6,182,212,0.4)" },
    "romance": { bg: "#db2777", ring: "#ec4899", glow: "rgba(236,72,153,0.4)" },
    "thriller": { bg: "#ea580c", ring: "#f97316", glow: "rgba(249,115,22,0.4)" },
    "suspenso": { bg: "#ea580c", ring: "#f97316", glow: "rgba(249,115,22,0.4)" },
    "aventura": { bg: "#16a34a", ring: "#22c55e", glow: "rgba(34,197,94,0.4)" },
    "adventure": { bg: "#16a34a", ring: "#22c55e", glow: "rgba(34,197,94,0.4)" },
    "animacion": { bg: "#9333ea", ring: "#a855f7", glow: "rgba(168,85,247,0.4)" },
    "animation": { bg: "#9333ea", ring: "#a855f7", glow: "rgba(168,85,247,0.4)" },
    "fantasia": { bg: "#0d9488", ring: "#14b8a6", glow: "rgba(20,184,166,0.4)" },
    "fantasy": { bg: "#0d9488", ring: "#14b8a6", glow: "rgba(20,184,166,0.4)" },
};

const FALLBACK_COLORS = [
    { bg: "#2563eb", ring: "#3b82f6", glow: "rgba(59,130,246,0.4)" },
    { bg: "#059669", ring: "#10b981", glow: "rgba(16,185,129,0.4)" },
    { bg: "#d97706", ring: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
];

const PRIMARY_COLOR = { bg: "#16a34a", ring: "#22c55e", glow: "rgba(34,197,94,0.5)" };

function getClusterColor(cluster: string | null | undefined, index: number) {
    if (!cluster) return FALLBACK_COLORS[index % FALLBACK_COLORS.length];

    const normalized = cluster.toLowerCase().trim();
    if (CLUSTER_COLORS[normalized]) return CLUSTER_COLORS[normalized];

    for (const [key, color] of Object.entries(CLUSTER_COLORS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return color;
        }
    }

    return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

// Neural Network Node Component - Stitch Design
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
    color: { bg: string; ring: string; glow: string };
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
                opacity: isDimmed ? 0.15 : 1,
                scale: isHovered ? 1.15 : 1,
                filter: isDimmed ? "blur(1px)" : "blur(0px)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onMouseEnter={() => onHover(node.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(node)}
            className="cursor-pointer"
            style={{ transformOrigin: `${x}px ${y}px` }}
        >
            {/* Pulsing glow effect when hovered */}
            {isHovered && (
                <>
                    <motion.circle
                        cx={x}
                        cy={y}
                        r={size + 20}
                        fill="none"
                        stroke={color.ring}
                        strokeWidth={2}
                        strokeOpacity={0.3}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.circle
                        cx={x}
                        cy={y}
                        r={size + 12}
                        fill="none"
                        stroke={color.ring}
                        strokeWidth={3}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                    />
                </>
            )}

            {/* Connected glow */}
            {isConnected && !isHovered && (
                <circle
                    cx={x}
                    cy={y}
                    r={size + 8}
                    fill="none"
                    stroke={color.ring}
                    strokeWidth={2}
                    strokeOpacity={0.4}
                />
            )}

            {/* Main circle with gradient border */}
            <circle
                cx={x}
                cy={y}
                r={size}
                fill="hsl(var(--background))"
                stroke={color.ring}
                strokeWidth={isHovered ? 4 : isSource ? 3.5 : 2.5}
                style={{ filter: isHovered || isConnected ? `drop-shadow(0 0 12px ${color.glow})` : 'none' }}
            />

            {/* Clip path for poster */}
            <clipPath id={`clip-${node.id}`}>
                <circle cx={x} cy={y} r={size - 4} />
            </clipPath>

            {/* Poster image */}
            {node.movie.posterUrl && (
                <image
                    href={node.movie.posterUrl}
                    x={x - size + 4}
                    y={y - size + 4}
                    width={(size - 4) * 2}
                    height={(size - 4) * 2}
                    clipPath={`url(#clip-${node.id})`}
                    preserveAspectRatio="xMidYMid slice"
                    style={{ opacity: isDimmed ? 0.3 : 1 }}
                />
            )}

            {/* Score/Rating badge */}
            <g transform={`translate(${x + size * 0.7}, ${y - size * 0.7})`}>
                <circle
                    r={14}
                    fill={color.bg}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                />
                {isSource ? (
                    <>
                        <Star
                            x={-6}
                            y={-6}
                            width={12}
                            height={12}
                            fill="hsl(var(--primary-foreground))"
                            stroke="none"
                        />
                    </>
                ) : (
                    <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="hsl(var(--primary-foreground))"
                        fontSize={10}
                        fontWeight={700}
                    >
                        {Math.round(node.score || 0)}%
                    </text>
                )}
            </g>
        </motion.g>
    );
}

// Curved connection line with animation
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
    const midX = (x1 + x2) / 2;
    const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

    return (
        <>
            {/* Glow layer for active edges */}
            {isActive && (
                <motion.path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={6}
                    strokeOpacity={0.3}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                />
            )}
            <motion.path
                d={path}
                fill="none"
                stroke={isActive ? color : "hsl(var(--border))"}
                strokeWidth={isActive ? 2.5 : 1}
                strokeOpacity={isActive ? 1 : 0.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay }}
            />
        </>
    );
}

// Glassmorphic Tooltip Component
function GlassTooltip({
    node,
    edge,
    x,
    y
}: {
    node: ConstellationNode;
    edge?: ConstellationEdge;
    x: number;
    y: number;
}) {
    const isSource = node.type === 'source';

    return (
        <motion.foreignObject
            x={x - 120}
            y={y + 60}
            width={240}
            height={140}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 shadow-2xl">
                <div className="flex items-start gap-3">
                    {node.movie.posterUrl && (
                        <div className="w-12 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                            <img
                                src={node.movie.posterUrl}
                                alt={node.movie.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">
                            {node.movie.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {node.movie.year}
                            {node.movie.cluster && ` • ${node.movie.cluster}`}
                        </p>
                        {isSource ? (
                            <div className="flex items-center gap-1 mt-1.5">
                                <Star className="w-3 h-3 fill-primary text-primary" />
                                <span className="text-xs text-primary font-medium">Tu rating: {node.rating}/5</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 mt-1.5">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span className="text-xs text-amber-400 font-medium">{Math.round(node.score || 0)}% compatible</span>
                            </div>
                        )}
                    </div>
                </div>
                {edge && !isSource && (
                    <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground line-clamp-2">{edge.reason}</p>
                    </div>
                )}
            </div>
        </motion.foreignObject>
    );
}

// Detail Modal Component - Premium Stitch Design
function RecommendationDetailModal({
    node,
    edge,
    sourceNode,
    onClose,
}: {
    node: ConstellationNode;
    edge?: ConstellationEdge;
    sourceNode?: ConstellationNode;
    onClose: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-card/95 backdrop-blur-xl border border-border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted hover:bg-muted/80 border border-border transition-colors"
                >
                    <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Poster side */}
                    <div className="relative w-full md:w-2/5 aspect-[2/3] md:aspect-auto">
                        {node.movie.posterUrl ? (
                            <Image
                                src={node.movie.posterUrl}
                                alt={node.movie.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Film className="w-16 h-16 text-muted-foreground" />
                            </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:bg-gradient-to-r" />

                        {/* Title on poster (mobile) */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:hidden">
                            <h2 className="text-2xl font-bold text-foreground">{node.movie.title}</h2>
                            <p className="text-muted-foreground text-sm">{node.movie.year}</p>
                        </div>
                    </div>

                    {/* Info side */}
                    <div className="flex-1 p-6">
                        {/* Title (desktop) */}
                        <div className="hidden md:block mb-4">
                            <h2 className="text-2xl font-bold text-foreground">{node.movie.title}</h2>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                                {node.movie.year && <span>{node.movie.year}</span>}
                                {node.movie.cluster && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span className="capitalize">{node.movie.cluster}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Compatibility badge */}
                        <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary px-4 py-2 rounded-full mb-5">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-bold text-lg">{Math.round(node.score || 0)}%</span>
                            <span className="text-primary/80">Compatible</span>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border mb-5" />

                        {/* Reasons section */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3">¿Por qué te lo recomendamos?</h3>
                            <ul className="space-y-3">
                                {edge && (
                                    <li className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Clapperboard className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-sm text-muted-foreground pt-1.5">{edge.reason}</span>
                                    </li>
                                )}
                                {node.movie.cluster && (
                                    <li className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                            <Tag className="w-4 h-4 text-violet-400" />
                                        </div>
                                        <span className="text-sm text-muted-foreground pt-1.5">Género: {node.movie.cluster}</span>
                                    </li>
                                )}
                                <li className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                        <Users className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <span className="text-sm text-muted-foreground pt-1.5">Popular entre usuarios con gustos similares</span>
                                </li>
                            </ul>
                        </div>

                        {/* Mini connection graph */}
                        {sourceNode && (
                            <div className="mt-5 pt-5 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-2">Conexión</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border-2 border-primary">
                                        {sourceNode.movie.posterUrl && (
                                            <img src={sourceNode.movie.posterUrl} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-border relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border-2 border-border">
                                        {node.movie.posterUrl && (
                                            <img src={node.movie.posterUrl} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3 mt-6">
                            <Link
                                href={`/app/movies/${node.movie.id}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-medium transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Ver Detalles
                            </Link>
                            <button className="px-5 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function ConstellationMap({ data }: ConstellationMapProps) {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(null);

    // Layout dimensions - generous spacing
    const width = 1200;
    const height = 600;
    const padding = 120;
    const sourceX = padding + 80;
    const recX = width - padding - 80;

    // Separate nodes by type
    const sourceNodes = data.nodes.filter(n => n.type === 'source');
    const recNodes = data.nodes.filter(n => n.type === 'recommendation');

    // Limit nodes for clean visualization
    const limitedSourceNodes = sourceNodes.slice(0, 4);
    const limitedRecNodes = recNodes.slice(0, 8);

    // Calculate positions
    const positions = useMemo(() => {
        const pos: Record<string, { x: number; y: number; size: number; color: { bg: string; ring: string; glow: string } }> = {};

        const sourceSpacing = (height - padding * 2) / (limitedSourceNodes.length + 1);
        limitedSourceNodes.forEach((node, i) => {
            pos[node.id] = {
                x: sourceX,
                y: padding + sourceSpacing * (i + 1),
                size: 55,
                color: PRIMARY_COLOR,
            };
        });

        const recSpacing = (height - padding * 2) / (limitedRecNodes.length + 1);
        limitedRecNodes.forEach((node, i) => {
            pos[node.id] = {
                x: recX,
                y: padding + recSpacing * (i + 1),
                size: 42,
                color: getClusterColor(node.movie.cluster, i),
            };
        });

        return pos;
    }, [limitedSourceNodes, limitedRecNodes]);

    // Filter edges
    const visibleEdges = useMemo(() => {
        const visibleNodeIds = new Set([
            ...limitedSourceNodes.map(n => n.id),
            ...limitedRecNodes.map(n => n.id)
        ]);
        return data.edges.filter(e =>
            visibleNodeIds.has(e.sourceId) && visibleNodeIds.has(e.targetId)
        );
    }, [data.edges, limitedSourceNodes, limitedRecNodes]);

    // Connected nodes when hovering
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
        const seen = new Map<string, { bg: string; ring: string; glow: string }>();
        limitedRecNodes.forEach((node, i) => {
            const cluster = node.movie.cluster || 'Otro';
            if (!seen.has(cluster)) {
                seen.set(cluster, getClusterColor(node.movie.cluster, i));
            }
        });
        return Array.from(seen.entries()).slice(0, 5);
    }, [limitedRecNodes]);

    // Find edge and source for selected node
    const selectedEdge = selectedNode ? data.edges.find(e => e.targetId === selectedNode.id) : undefined;
    const selectedSource = selectedEdge ? data.nodes.find(n => n.id === selectedEdge.sourceId) : undefined;

    if (limitedSourceNodes.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Tu universo está vacío</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Califica películas con 4-5 estrellas para construir tu constelación personal de recomendaciones.
                </p>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-5 mb-8">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ background: PRIMARY_COLOR.ring, boxShadow: `0 0 8px ${PRIMARY_COLOR.glow}` }}
                    />
                    <span className="text-sm text-muted-foreground">Tus favoritas</span>
                </div>
                {clusters.map(([name, color]) => (
                    <div key={name} className="flex items-center gap-2.5">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ background: color.ring, boxShadow: `0 0 8px ${color.glow}` }}
                        />
                        <span className="text-sm text-muted-foreground capitalize">{name}</span>
                    </div>
                ))}
            </div>

            {/* SVG Canvas */}
            <div className="overflow-x-auto pb-6">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full max-w-5xl mx-auto"
                    style={{ minWidth: 800 }}
                >
                    {/* Edges */}
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
                                    color={target.color.ring}
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

                    {/* Tooltips */}
                    <AnimatePresence>
                        {hoveredNode && (() => {
                            const node = data.nodes.find(n => n.id === hoveredNode);
                            const pos = node ? positions[node.id] : null;
                            if (!node || !pos) return null;
                            const edge = data.edges.find(e => e.targetId === node.id);
                            return (
                                <GlassTooltip
                                    key={node.id}
                                    node={node}
                                    edge={edge}
                                    x={pos.x}
                                    y={pos.y}
                                />
                            );
                        })()}
                    </AnimatePresence>
                </svg>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedNode && (
                    <RecommendationDetailModal
                        node={selectedNode}
                        edge={selectedEdge}
                        sourceNode={selectedSource}
                        onClose={() => setSelectedNode(null)}
                    />
                )}
            </AnimatePresence>

            {/* Hint */}
            <p className="text-center text-xs text-muted-foreground/60 mt-4">
                Pasa el cursor sobre cualquier nodo para ver detalles • Haz clic para explorar
            </p>
        </div>
    );
}
