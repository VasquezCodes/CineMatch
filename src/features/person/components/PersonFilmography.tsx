'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonCreditsGrid } from './PersonCreditsGrid';
import type { PersonProfile, CreditCategory } from '../types';

type PersonFilmographyProps = {
  profile: PersonProfile;
};

export function PersonFilmography({ profile }: PersonFilmographyProps) {
  // Construir categorías dinámicamente solo con las que tienen contenido
  const categories: CreditCategory[] = [];

  // Priorizar por departamento conocido
  const departmentOrder: Array<keyof PersonProfile['credits']['crew'] | 'cast'> =
    profile.known_for_department === 'Acting'
      ? ['cast', 'directing', 'writing', 'production', 'camera', 'sound']
      : profile.known_for_department === 'Directing'
      ? ['directing', 'cast', 'writing', 'production', 'camera', 'sound']
      : ['directing', 'writing', 'cast', 'camera', 'sound', 'production'];

  const categoryTitles: Record<string, string> = {
    cast: 'Actuación',
    directing: 'Dirección',
    writing: 'Guión',
    production: 'Producción',
    camera: 'Fotografía',
    sound: 'Música',
  };

  departmentOrder.forEach((key) => {
    const movies = key === 'cast' ? profile.credits.cast : profile.credits.crew[key];
    if (movies && movies.length > 0) {
      categories.push({
        key,
        title: categoryTitles[key] || key,
        movies,
      });
    }
  });

  // Agregar "Otros" si existe y tiene contenido
  if (profile.credits.crew.other && profile.credits.crew.other.length > 0) {
    categories.push({
      key: 'other',
      title: 'Otros Créditos',
      movies: profile.credits.crew.other,
    });
  }

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          No hay información de filmografía disponible.
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState(categories[0].key);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold">Filmografía</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          {categories.map((category) => (
            <TabsTrigger
              key={category.key}
              value={category.key}
              className="whitespace-nowrap"
            >
              {category.title} ({category.movies.length})
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent
            key={category.key}
            value={category.key}
            className="mt-6"
          >
            <PersonCreditsGrid movies={category.movies} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
