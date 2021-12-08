import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

export default function GroupingColumnsInitialState() {
  const data = useMovieData();

  const columns = React.useMemo(
    () => [
      ...data.columns.map((colDef) =>
        ['title'].includes(colDef.field) ? { ...colDef, hide: true } : colDef,
      ),
      {
        field: 'marvelCinematicUniversePhase',
        headerName: 'MCU Phase',
        valueGetter: (params) =>
          params.row.marvelCinematicUniversePhase == null
            ? null
            : `Phase n°${params.row.marvelCinematicUniversePhase}`,
        hide: true,
      },
    ],
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
            model: ['marvelCinematicUniversePhase'],
          },
        }}
        groupingColDef={{
          leafField: 'title',
        }}
        experimentalFeatures={{
          groupingColumns: true,
        }}
      />
    </div>
  );
}
