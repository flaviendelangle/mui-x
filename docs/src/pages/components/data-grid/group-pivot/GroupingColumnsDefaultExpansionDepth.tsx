import * as React from 'react';
import { DataGridPro, GridColumns } from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

export default function GroupingColumnsDefaultExpansionDepth() {
  const data = useMovieData();

  const columns = React.useMemo<GridColumns>(
    () =>
      data.columns.map((colDef) =>
        ['company', 'director'].includes(colDef.field)
          ? { ...colDef, hide: true }
          : colDef,
      ),
    [data.columns],
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        {...data}
        columns={columns}
        defaultGroupingExpansionDepth={-1}
        disableSelectionOnClick
        initialState={{
          groupingColumns: {
            model: ['company', 'director'],
          },
        }}
      />
    </div>
  );
}
