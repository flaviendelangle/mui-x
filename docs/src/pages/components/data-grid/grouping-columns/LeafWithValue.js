import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useMovieRows } from '@mui/x-data-grid-generator';

const columns = [
  { field: 'title', hide: true, headerName: 'Title' },
  {
    field: 'gross',
    headerName: 'Gross',
    type: 'number',
  },
  {
    field: 'company',
    headerName: 'Company',
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
  const rows = useMovieRows();

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        rows={rows}
        columns={columns}
        groupingColDef={{ width: 250, leafField: 'title', headerName: 'Title' }}
        getRowId={getRowId}
        initialState={{
          groupingColumns: {
            model: ['company'],
          },
        }}
      />
    </div>
  );
}
