"use client";

/**
 * @param {import('next/image').ImageLoaderProps} props
 */
export default function cloudinaryLoader({ src, width, quality }) {
    const params = [
        "f_auto",
        "c_limit",
        `w_${width}`,
        `q_${quality || "auto"}`,
    ];
    return `https://res.cloudinary.com/dx0bgvlht/image/fetch/${params.join(",")}/${src}`;
}
