import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

export default function GroupingColumnsMultipleGroupingCol() {
  const data = useMovieData();

  const columns = React.useMemo(
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
        groupingColumnMode="multiple"
        initialState={{
          groupingColumns: {
            model: ['company', 'director'],
          },
        }}
      />
    </div>
  );
}
