import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { Meta } from '@storybook/react';
import { useDemoData } from '@mui/x-data-grid-generator';

export default {
  title: 'X-Grid Tests/Row Grouping',
  component: DataGridPro,
  parameters: {
    options: { selectedPanel: 'storybook/storysource/panel' },
  },
} as Meta;

export function BasicRowGrouping() {
  const { data, loading } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 100,
    maxColumns: 12,
  });

  const columns = React.useMemo(
    () =>
      data.columns.map((col) =>
        ['commodity', 'status'].includes(col.field) ? { ...col, groupRows: true } : col,
      ),
    [data.columns],
  );

  return (
    <DataGridPro
      loading={loading}
      disableSelectionOnClick
      defaultGroupingExpansionDepth={2}
      {...data}
      columns={columns}
    />
  );
}
