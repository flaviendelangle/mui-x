import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function GroupingColumnsCustomGroupingColDefObject() {
  const data = useMovieData();
  const [groupingColumnsModel, setGroupingColumnsModel] = React.useState([
    'company',
    'director',
  ]);

  const columns = React.useMemo(
    () =>
      data.columns.map((colDef) =>
        groupingColumnsModel.includes(colDef.field)
          ? { ...colDef, hide: true }
          : colDef,
      ),
    [data.columns, groupingColumnsModel],
  );

  return (
    <div style={{ width: '100%' }}>
      <Stack
        sx={{ width: '100%', mb: 1 }}
        direction="row"
        alignItems="flex-start"
        columnGap={1}
      >
        <Button size="small" onClick={() => setGroupingColumnsModel(['company'])}>
          Group by company
        </Button>
        <Button
          size="small"
          onClick={() => setGroupingColumnsModel(['company', 'director'])}
        >
          Group by company and director
        </Button>
      </Stack>
      <Box sx={{ height: 400 }}>
        <DataGridPro
          {...data}
          columns={columns}
          disableSelectionOnClick
          groupingColumnsModel={groupingColumnsModel}
          groupingColDef={(params) =>
            params.fields.includes('director')
              ? {
                  headerName: 'Director',
                }
              : {}
          }
          experimentalFeatures={{
            groupingColumns: true,
          }}
        />
      </Box>
    </div>
  );
}
