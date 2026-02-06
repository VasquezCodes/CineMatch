// Constellation Map Types for Recommendations Visualization

export interface ConstellationNode {
    id: string;
    type: 'source' | 'recommendation';
    movie: {
        id: string;
        title: string;
        posterUrl: string | null;
        year: number | null;
        cluster?: string | null; // Genre/category for color coding
    };
    // Position will be calculated client-side
    rating?: number; // For source movies (user's rating)
    score?: number;  // For recommendations (match percentage)
}

export interface ConstellationEdge {
    id: string;
    sourceId: string; // Source movie ID
    targetId: string; // Recommendation movie ID
    reason: string;   // Why this recommendation
    strength: number; // 0-1, affects visual weight
}

export interface ConstellationData {
    nodes: ConstellationNode[];
    edges: ConstellationEdge[];
}

// Position for rendering (calculated client-side)
export interface PositionedNode extends ConstellationNode {
    x: number;
    y: number;
    radius: number;
}
