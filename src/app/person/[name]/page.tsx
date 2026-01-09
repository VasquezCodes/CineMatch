import { notFound } from 'next/navigation';
import { getPersonProfile, PersonHeader, PersonFilmography } from '@/features/person';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ name: string }>;
};

export default async function PersonPage({ params }: PageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const profile = await getPersonProfile(decodedName);

  // Manejar error
  if ('error' in profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Botón Volver */}
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/library">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>

        {/* Header con Biografía */}
        <PersonHeader profile={profile} />

        {/* Filmografía */}
        <PersonFilmography profile={profile} />
      </div>
    </div>
  );
}
