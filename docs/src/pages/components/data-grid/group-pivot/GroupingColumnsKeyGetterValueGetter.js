import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

export default function GroupingColumnsKeyGetter() {
  const data = useMovieData();

  const columns = React.useMemo(
    () => [
      ...data.columns,
      {
        field: 'decade',
        headerName: 'Decade',
        hide: true,
        valueGetter: (params) => {
          const value = Math.floor(params.row.year / 10) * 10;

          if (params.row.year == null) {
            return null;
          }

          return {
            value,
            name: `${value.toString().slice(-2)}'s`,
          };
        },
        keyGetter: (params) => params.value?.value,
        renderCell: (params) => params.value?.name,
      },
    ],
    [data.columns],
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        {...data}
        columns={columns}
        initialState={{
          groupingColumns: {
            model: ['decade'],
          },
        }}
        experimentalFeatures={{
          groupingColumns: true,
        }}
      />
    </div>
  );
}
