"use client";

/**
 * @param {import('next/image').ImageLoaderProps} props
 */
export default function cloudinaryLoader({ src, width, quality }) {
    // Si la URL es de TMDB, devolverla directamente sin procesar por Cloudinary
    if (src.startsWith('https://image.tmdb.org/')) {
        return src;
    }

    const params = [
        "f_auto",
        "c_limit",
        `w_${width}`,
        `q_${quality || "auto"}`,
    ];
    return `https://res.cloudinary.com/dx0bgvlht/image/fetch/${params.join(",")}/${src}`;
}
