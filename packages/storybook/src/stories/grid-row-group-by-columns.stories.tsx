import * as React from 'react';
import { DataGridPro, DataGridProProps } from '@mui/x-data-grid-pro';
import { Meta } from '@storybook/react';
import { UseDemoDataOptions, DemoDataReturnType, useDemoData } from '@mui/x-data-grid-generator';

export default {
  title: 'X-Grid Tests/Row Grouped By Columns',
  component: DataGridPro,
  parameters: {
    options: { selectedPanel: 'storybook/storysource/panel' },
  },
} as Meta;

interface UseDemoDataGroupedByColumnsOptions extends UseDemoDataOptions {
  groupedColumns: string[];
}

const useGroupedByColumnsDemoData = ({
  groupedColumns,
  ...options
}: UseDemoDataGroupedByColumnsOptions): DemoDataReturnType => {
  const response = useDemoData(options);

  const columns = React.useMemo(
    () =>
      response.data.columns.map((col) => {
        if (!groupedColumns.includes(col.field)) {
          return col;
        }

        const groupedCol = {
          ...col,
          groupRows: true,
          hide: true,
          groupRowIndex: groupedColumns.indexOf(col.field),
        };

        if (groupedCol.field === 'counterPartyCountry') {
          groupedCol.keyGetter = (params) => {
            return (params.value as any).label;
          };
        }

        return groupedCol;
      }),
    [response.data.columns, groupedColumns],
  );

  return {
    ...response,
    data: {
      ...response.data,
      columns,
    },
  };
};

export function BasicRowGrouping() {
  const { data, loading } = useGroupedByColumnsDemoData({
    dataSet: 'Commodity',
    rowLength: 100,
    maxColumns: 25,
    groupedColumns: ['status', 'counterPartyCurrency'],
  });

  const groupingColDef = React.useMemo<DataGridProProps['groupingColDef']>(
    () => ({
      width: 300,
    }),
    [],
  );

  return (
    <DataGridPro
      loading={loading}
      disableSelectionOnClick
      {...data}
      groupingColDef={groupingColDef}
      rowGroupByColumnPanel
    />
  );
}
