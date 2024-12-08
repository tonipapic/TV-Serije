export interface SerijeDetailI {
  id: number;
  name: string;
  poster_path: string;
  overview: string;
  number_of_seasons: number;
  number_of_episodes: number;
  homepage: string;
}

export interface SerijeDetailForDBI {
  TMDB_ID_serije: number;
  Naziv: string;
  Opis: string;
  Slika: string;
  Broj_sezona: number;
  Broj_epizoda: number;
  Popularnost: number;
  Homepage: string;
  Seasons: any;
}
