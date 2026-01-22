// Tipos específicos del feature qualifications

export interface QualityCategory {
    id: number;
    name: string;
    description: string | null;
    qualities: Quality[];
}

export interface Quality {
    id: number;
    category_id: number;
    name: string;
}

export interface UserMovieQuality {
    id: string;
    user_id: string;
    movie_id: string;
    quality_id: number;
    created_at: string | null;
}

// Tipo para la respuesta agrupada con cualidades seleccionadas
export interface QualityCategoryWithSelection extends QualityCategory {
    qualities: (Quality & { selected: boolean })[];
}
