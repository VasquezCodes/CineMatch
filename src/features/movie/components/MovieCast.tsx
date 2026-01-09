import Image from "next/image";
import { User } from "lucide-react";
import { PersonLink } from "@/components/shared/PersonLink";

type CastMember = {
  name: string;
  role: string;
  photo?: string;
};

type MovieCastProps = {
  cast: CastMember[];
  crew?: Array<{ name: string; job: string; photo?: string }>;
};

export function MovieCast({ cast, crew }: MovieCastProps) {
  if (cast.length === 0 && (!crew || crew.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Reparto Principal */}
      {cast.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Reparto Principal</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cast.map((member, idx) => (
              <div
                key={`${member.name}-${idx}`}
                className="flex flex-col items-center text-center"
              >
                <PersonLink name={member.name} className="contents">
                  <div className="relative w-full aspect-[2/3] mb-2 overflow-hidden rounded-lg bg-muted border border-border/40 transition-transform hover:scale-105 cursor-pointer">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                        <User className="h-8 w-8 opacity-30" />
                      </div>
                    )}
                  </div>
                </PersonLink>
                <PersonLink
                  name={member.name}
                  className="text-sm font-medium line-clamp-2"
                />
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipo Técnico */}
      {crew && crew.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Equipo Técnico</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {crew.map((member, idx) => (
              <div
                key={`${member.name}-${idx}`}
                className="flex flex-col items-center text-center"
              >
                <PersonLink name={member.name} className="contents">
                  <div className="relative w-full aspect-[2/3] mb-2 overflow-hidden rounded-lg bg-muted border border-border/40 transition-transform hover:scale-105 cursor-pointer">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                        <User className="h-8 w-8 opacity-30" />
                      </div>
                    )}
                  </div>
                </PersonLink>
                <PersonLink
                  name={member.name}
                  className="text-sm font-medium line-clamp-2"
                />
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {member.job}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
