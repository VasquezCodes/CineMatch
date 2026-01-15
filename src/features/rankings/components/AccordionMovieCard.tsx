"use client";

import { motion } from "framer-motion";
import Image from "@/components/CloudinaryImage";

interface AccordionMovieCardProps {
  id: string;
  title: string;
  year: number;
  posterUrl: string | null;
  director?: string;
  showDirector?: boolean;
  userRating?: number;
}

export function AccordionMovieCard({
  title,
  year,
  posterUrl,
  director,
  showDirector = true,
  userRating,
}: AccordionMovieCardProps) {
  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-slate-200/50 bg-slate-100">
        {posterUrl ? (
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full w-full"
          >
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          </motion.div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <span className="text-xs text-slate-400">Sin poster</span>
          </div>
        )}
        {userRating && userRating > 0 && (
          <div className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded bg-background/80 backdrop-blur-sm text-[10px] font-bold text-accent border border-accent/20">
            {userRating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="mt-2 space-y-0.5">
        <h4 className="line-clamp-2 text-xs font-medium leading-tight text-slate-900">
          {title}
        </h4>
        <p className="text-xs text-slate-500">{year}</p>
        {showDirector && director && (
          <p className="text-xs text-slate-400">{director}</p>
        )}
      </div>
    </div>
  );
}
