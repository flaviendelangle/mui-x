import * as React from 'react';
import { DataGridPro, GridColumns } from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

export default function GroupingColumnsColDefCanBeGrouped() {
  const data = useMovieData();

  const columns = React.useMemo<GridColumns>(
    () =>
      data.columns.map((inputColDef) => {
        const colDef = { ...inputColDef };

        if (['company', 'director'].includes(colDef.field)) {
          colDef.hide = true;
        }

        if (colDef.field === 'director') {
          colDef.canBeGrouped = false;
        }

        return colDef;
      }),
    [data.columns],
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        {...data}
        columns={columns}
        disableSelectionOnClick
        initialState={{
          groupingColumns: {
            model: ['company', 'director'],
          },
        }}
        experimentalFeatures={{
          groupingColumns: true,
        }}
      />
    </div>
  );
}
