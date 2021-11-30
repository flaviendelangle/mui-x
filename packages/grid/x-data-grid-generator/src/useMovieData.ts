import { GridColumns, GridComponentProps, GridRowModel } from '@mui/x-data-grid';

type Movie = {
  title: string;
  gross: number;
  director: string;
  company: string;
  year: number;
  composer: { name: string };
  marvelCinematicUniversePhase?: number;
};

const COLUMNS: GridColumns = [
  { field: 'title', headerName: 'Title', width: 200 },
  {
    field: 'gross',
    headerName: 'Gross',
    type: 'number',
    width: 150,
  },
  {
    field: 'company',
    headerName: 'Company',
    width: 200,
    hide: true,
  },
  {
    field: 'director',
    headerName: 'Director',
    width: 200,
    hide: true,
  },
  {
    field: 'year',
    headerName: 'Year',
  },
];

const ROWS: GridRowModel<Movie>[] = [
  {
    title: 'Avatar',
    gross: 2847246203,
    director: 'James Cameron',
    company: '20th Century Fox',
    year: 2009,
    composer: {
      name: 'James Horner',
    },
  },
  {
    title: 'Avengers: Endgame',
    gross: 2797501328,
    director: 'Anthony & Joe Russo',
    company: 'Disney Studios',
    year: 2019,
    marvelCinematicUniversePhase: 3,
    composer: {
      name: 'Alan Silvestri',
    },
  },
  {
    title: 'Titanic',
    gross: 2187425379,
    director: 'James Cameron',
    company: '20th Century Fox',
    year: 1997,
    composer: {
      name: 'James Horner',
    },
  },
  {
    title: 'Star Wars: The Force Awakens',
    gross: 2068223624,
    director: 'J. J. Abrams',
    company: 'Disney Studios',
    year: 2015,
    composer: {
      name: 'John Williams',
    },
  },
  {
    title: 'Avengers: Infinity War',
    gross: 2048359754,
    director: 'Anthony & Joe Russo',
    company: 'Disney Studios',
    year: 2018,
    marvelCinematicUniversePhase: 3,
    composer: {
      name: 'Alan Silvestri',
    },
  },
  {
    title: 'Jurassic World',
    gross: 1671713208,
    director: 'Colin Trevorrow',
    company: 'Universal Pictures',
    year: 2015,
    composer: {
      name: 'Michael Giacchino',
    },
  },
  {
    title: 'The Lion King',
    gross: 1656943394,
    director: 'Jon Favreau',
    company: 'Disney Studios',
    year: 2019,
    composer: {
      name: 'Hans Zimmer',
    },
  },
  {
    title: 'The Avengers',
    gross: 1518812988,
    director: 'Joss Whedon',
    company: 'Disney Studios',
    year: 2012,
    marvelCinematicUniversePhase: 1,
    composer: {
      name: 'Alan Silvestri',
    },
  },
  {
    title: 'Furious 7',
    gross: 1516045911,
    director: 'James Wan',
    company: 'Universal Pictures',
    year: 2015,
    composer: {
      name: 'Brian Tyler',
    },
  },
  {
    title: 'Frozen II',
    gross: 1450026933,
    director: 'Chris Buck & Jennifer Lee',
    company: 'Disney Studios',
    year: 2019,
    composer: {
      name: 'Christophe Beck',
    },
  },
  {
    title: 'Avengers: Age of Ultron',
    gross: 1402804868,
    director: 'Joss Whedon',
    company: 'Disney Studios',
    year: 2015,
    marvelCinematicUniversePhase: 2,
    composer: {
      name: 'Danny Elfman',
    },
  },
  {
    title: 'Black Panther',
    gross: 1347280838,
    director: 'Ryan Coogler',
    company: 'Disney Studios',
    year: 2018,
    marvelCinematicUniversePhase: 3,
    composer: {
      name: 'Ludwig Göransson',
    },
  },
];

const getRowId = (row: any) => row.title;

export const useMovieData = (): Pick<GridComponentProps, 'rows' | 'columns' | 'getRowId'> => {
  return {
    getRowId,
    rows: ROWS,
    columns: COLUMNS,
  };
};
