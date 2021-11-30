import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

export default function GroupingColumnsInitialState() {
  const data = useMovieData();

  const columns = React.useMemo(
    () => [
      ...data.columns,
      {
        field: 'marvelCinematicUniversePhase',
        headerName: 'MCU Phase',
        renderCell: (params) => `Phase n°${params.value ?? '???'}`,
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
      />
    </div>
  );
}
