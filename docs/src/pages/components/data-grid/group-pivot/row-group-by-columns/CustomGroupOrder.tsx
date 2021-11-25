import * as React from 'react';
import { DataGridPro, GridColumns } from '@mui/x-data-grid-pro';

const rows = [
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
    composer: {
      name: 'Ludwig Göransson',
    },
  },
];

const columns: GridColumns = [
  { field: 'title', headerName: 'Title' },
  {
    field: 'gross',
    headerName: 'Gross',
    type: 'number',
  },
  {
    field: 'company',
    headerName: 'Company',
    groupRows: true,
    hide: true,
    groupRowIndex: 1,
  },
  {
    field: 'director',
    headerName: 'Director',
    groupRows: true,
    hide: true,
    groupRowIndex: 0,
  },
  {
    field: 'year',
    headerName: 'Year',
  },
];

const getRowId = (row) => row.title;

export default function CustomGroupOrder() {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        rows={rows}
        columns={columns}
        groupingColDef={{ width: 250 }}
        getRowId={getRowId}
      />
    </div>
  );
}
