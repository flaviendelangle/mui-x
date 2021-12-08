import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';
import Stack from '@mui/material/Stack';
import { InputLabel, Select } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

export default function GroupingColumnsSortingSingleGroupingColDef() {
  const data = useMovieData();
  const [mainGroupingCriteria, setMainGroupingCriteria] =
    React.useState('undefined');

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
    <Stack style={{ width: '100%' }} alignItems="flex-start" spacing={2}>
      <FormControl fullWidth>
        <InputLabel
          htmlFor="main-grouping-criteria"
          id="ain-grouping-criteria-label"
        >
          Main Grouping Criteria
        </InputLabel>
        <Select
          label="Main Grouping Criteria"
          onChange={(e) => setMainGroupingCriteria(e.target.value)}
          value={mainGroupingCriteria}
          id="main-grouping-criteria"
          labelId="main-grouping-criteria-label"
        >
          <MenuItem value="undefined">Default behavior</MenuItem>
          <MenuItem value="company">Company</MenuItem>
          <MenuItem value="director">Director</MenuItem>
        </Select>
      </FormControl>
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
          groupingColumnMode="single"
          groupingColDef={{
            mainGroupingCriteria:
              mainGroupingCriteria === 'undefined'
                ? undefined
                : mainGroupingCriteria,
          }}
          experimentalFeatures={{
            groupingColumns: true,
          }}
        />
      </div>
    </Stack>
  );
}
