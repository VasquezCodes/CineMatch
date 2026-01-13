"use client";

import { PageHeader, Section } from "@/components/layout";
import { UploadWatchlistForm } from "@/features/watchlist";
import Papa from "papaparse";
import { processImport, type CsvMovieImport } from "@/features/import/actions";
import { toast } from "sonner";

export default function UploadPage() {
  const handleUpload = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const movies: CsvMovieImport[] = results.data
              .map((row: any) => ({
                imdb_id: row["Const"],
                title: row["Title"],
                year: parseInt(row["Year"]),
                position: row["Position"]
                  ? parseInt(row["Position"])
                  : undefined,
                user_rating: row["Your Rating"]
                  ? parseInt(row["Your Rating"])
                  : undefined,
                date_rated: row["Date Rated"],
                genres: row["Genres"],
                url: row["URL"],
                imdb_rating: row["IMDb Rating"]
                  ? parseFloat(row["IMDb Rating"])
                  : undefined,
                runtime_mins: row["Runtime (mins)"]
                  ? parseInt(row["Runtime (mins)"])
                  : undefined,
                release_date: row["Release Date"],
                directors: row["Directors"],
                num_votes: row["Num Votes"]
                  ? parseInt(row["Num Votes"])
                  : undefined,
              }))
              .filter((m) => m.imdb_id); // Filtrar filas sin ID

            const result = await processImport(movies, file.name);

            if (result.success) {
              resolve();
            } else {
              toast.error("Hubo un error en la importación.");
              reject();
            }
          } catch (error) {
            console.error(error);
            toast.error("Error procesando los datos del CSV.");
            reject(error);
          }
        },
        error: (error) => {
          console.error(error);
          toast.error("Error leyendo el archivo CSV.");
          reject(error);
        },
      });
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subida de Watchlist"
        description="Importá tu lista para enriquecer datos y empezar el análisis."
      />

      <Section>
        <UploadWatchlistForm onUpload={handleUpload} maxSizeMB={10} />
      </Section>
    </div>
  );
}
