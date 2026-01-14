export type MovieCredit = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  release_year?: string | number;
  vote_average?: number | null;
  vote_count?: number;
  character?: string;
  job?: string;
  overview?: string;
  db_id?: string | null;
};

export type PersonProfile = {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  photo_url: string | null;
  known_for_department: string;
  credits: {
    cast: MovieCredit[];
    crew: {
      directing: MovieCredit[];
      writing: MovieCredit[];
      production: MovieCredit[];
      camera: MovieCredit[];
      sound: MovieCredit[];
      other: MovieCredit[];
    };
  };
};

export type CreditCategory = {
  key: keyof PersonProfile['credits']['crew'] | 'cast';
  title: string;
  movies: MovieCredit[];
};
