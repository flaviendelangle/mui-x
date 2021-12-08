import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

export default function GroupingColumnsSortingMultipleGroupingColDef() {
  const data = useMovieData();
  const columns = React.useMemo(
    () =>
      data.columns.map((colDef) =>
        ['company', 'director', 'title'].includes(colDef.field)
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
        disableSelectionOnClick
        defaultGroupingExpansionDepth={-1}
        initialState={{
          groupingColumns: {
            model: ['company', 'director'],
          },
        }}
        groupingColumnMode="multiple"
        groupingColDef={(params) =>
          params.fields.includes('director')
            ? {
                leafField: 'title',
                mainGroupingCriteria: 'director',
              }
            : {}
        }
        experimentalFeatures={{
          groupingColumns: true,
        }}
      />
    </div>
  );
}
