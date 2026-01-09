import Image from "next/image";
import { User, Calendar, MapPin, Cake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PersonProfile } from "../types";

type PersonHeaderProps = {
  profile: PersonProfile;
};

export function PersonHeader({ profile }: PersonHeaderProps) {
  const age =
    profile.birthday && !profile.deathday
      ? new Date().getFullYear() - new Date(profile.birthday).getFullYear()
      : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 md:gap-8 pb-8 border-b border-border/50">
      {/* Foto de Perfil */}
      <div className="w-full max-w-[280px] md:max-w-none mx-auto md:mx-0">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-lg border border-border/40 bg-muted">
          {profile.photo_url ? (
            <Image
              src={profile.photo_url}
              alt={profile.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 280px, 320px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
              <User className="h-24 w-24 opacity-20" />
            </div>
          )}
        </div>
      </div>

      {/* Información del Perfil */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
            {profile.name}
          </h1>
          <Badge variant="secondary" className="text-sm">
            {profile.known_for_department}
          </Badge>
        </div>

        {/* Datos Personales */}
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          {profile.birthday && (
            <div className="flex items-center gap-2">
              <Cake className="h-4 w-4" />
              <span>
                {new Date(profile.birthday).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {age && !profile.deathday && ` (${age} años)`}
              </span>
            </div>
          )}
          {profile.deathday && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(profile.deathday).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          {profile.place_of_birth && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{profile.place_of_birth}</span>
            </div>
          )}
        </div>

        {/* Biografía */}
        <div className="pt-4">
          <h2 className="text-xl font-semibold mb-3">Biografía</h2>
          {profile.biography ? (
            <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-line">
              {profile.biography}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No hay información biográfica disponible para esta persona en
              nuestra base de datos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
