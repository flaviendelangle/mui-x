import { useDemoData } from '@mui/x-data-grid-generator';
import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';

const useGroupedByColumnsDemoData = ({ groupedColumns, ...options }) => {
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
            return params.value.label;
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

export default function RowGroupingFullExample() {
  const { data, loading } = useGroupedByColumnsDemoData({
    dataSet: 'Commodity',
    rowLength: 100,
    maxColumns: 25,
    groupedColumns: ['status', 'counterPartyCurrency'],
  });

  const groupingColDef = React.useMemo(
    () => ({
      width: 300,
    }),
    [],
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        loading={loading}
        disableSelectionOnClick
        {...data}
        groupingColDef={groupingColDef}
        rowGroupByColumnPanel
        groupingColumnMode="multiple"
      />
    </div>
  );
}
