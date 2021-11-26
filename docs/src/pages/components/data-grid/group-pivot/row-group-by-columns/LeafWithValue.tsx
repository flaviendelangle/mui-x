import * as React from 'react';
import { DataGridPro, GridColumns } from '@mui/x-data-grid-pro';

const rows = [
  {
    title: 'Avatar',
    gross: 2847246203,
    director: 'James Cameron',
    company: '20th Century Fox',
    year: 2009,
  },
  {
    title: 'Avengers: Endgame',
    gross: 2797501328,
    director: 'Anthony & Joe Russo',
    company: 'Disney Studios',
    year: 2019,
  },
  {
    title: 'Titanic',
    gross: 2187425379,
    director: 'James Cameron',
    company: '20th Century Fox',
    year: 1997,
  },
  {
    title: 'Star Wars: The Force Awakens',
    gross: 2068223624,
    director: 'J. J. Abrams',
    company: 'Disney Studios',
    year: 2015,
  },
  {
    title: 'Avengers: Infinity War',
    gross: 2048359754,
    director: 'Anthony & Joe Russo',
    company: 'Disney Studios',
    year: 2018,
  },
  {
    title: 'Jurassic World',
    gross: 1671713208,
    director: 'Colin Trevorrow',
    company: 'Universal Pictures',
    year: 2015,
  },
  {
    title: 'The Lion King',
    gross: 1656943394,
    director: 'Jon Favreau',
    company: 'Disney Studios',
    year: 2019,
  },
  {
    title: 'The Avengers',
    gross: 1518812988,
    director: 'Joss Whedon',
    company: 'Disney Studios',
    year: 2012,
  },
  {
    title: 'Furious 7',
    gross: 1516045911,
    director: 'James Wan',
    company: 'Universal Pictures',
    year: 2015,
  },
  {
    title: 'Frozen II',
    gross: 1450026933,
    director: 'Chris Buck & Jennifer Lee',
    company: 'Disney Studios',
    year: 2019,
  },
  {
    title: 'Avengers: Age of Ultron',
    gross: 1402804868,
    director: 'Joss Whedon',
    company: 'Disney Studios',
    year: 2015,
  },
  {
    title: 'Black Panther',
    gross: 1347280838,
    director: 'Ryan Coogler',
    company: 'Disney Studios',
    year: 2018,
  },
];

const columns: GridColumns = [
  { field: 'title', hide: true, headerName: 'Title' },
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
  },
  {
    field: 'director',
    headerName: 'Director',
  },
  {
    field: 'year',
    headerName: 'Year',
  },
];

const getRowId = (row) => row.title;

export default function LeafWithValue() {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        rows={rows}
        columns={columns}
        groupingColDef={{ width: 250, leafField: 'title', headerName: 'Title' }}
        getRowId={getRowId}
      />
    </div>
  );
}
