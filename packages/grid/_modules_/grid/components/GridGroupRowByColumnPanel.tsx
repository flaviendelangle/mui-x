import * as React from 'react';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import { useGridApiEventHandler } from '../hooks/utils/useGridApiEventHandler';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useGridSelector } from '../hooks/utils/useGridSelector';
import { GridEvents } from '../constants/eventsConstants';
import { GridColDef, GridColumnHeaderParams } from '../models';
import { gridRowGroupingColumnSelector } from '../hooks/features/rowGroupByColumns';
import { orderGroupingFields } from '../hooks/features/rowGroupByColumns/rowGroupByColumnsUtils';
import { isDeepEqual } from '../utils/utils';

const GridGroupRowByColumnPanelRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'GroupRowByColumnPanel',
})({
  display: 'flex',
  alignItems: 'stretch',
  height: 48,
});

const GridGroupingChipContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1, 2),
}));

const GridGroupingEmptySpace = styled('div')({
  flex: '1 1 auto',
});

/**
 * Only available in DataGridPro
 * TODO: Allow to reorder the chips
 */
export const GridGroupRowByColumnPanel = () => {
  const apiRef = useGridApiContext();
  const [colHeaderDragField, setColHeaderDragField] = React.useState('');
  const groupingColumns = useGridSelector(apiRef, gridRowGroupingColumnSelector);
  const groupingFields = React.useMemo(
    () => orderGroupingFields(groupingColumns),
    [groupingColumns],
  );

  const handleColumnReorderStart = React.useCallback(
    (params: GridColumnHeaderParams) => setColHeaderDragField(params.field),
    [],
  );
  const handleColumnReorderStop = React.useCallback(() => setColHeaderDragField(''), []);

  const handleDragEnter = (fieldAfter: string | null) => {
    if (!colHeaderDragField || colHeaderDragField === fieldAfter) {
      return;
    }

    const cleanGroupingFields = groupingFields.filter((field) => field !== colHeaderDragField);
    const position = fieldAfter
      ? cleanGroupingFields.findIndex((field) => field === fieldAfter)
      : cleanGroupingFields.length;
    const newGroupingFields = [
      ...cleanGroupingFields.slice(0, position),
      colHeaderDragField,
      ...cleanGroupingFields.slice(position),
    ];

    if (isDeepEqual(groupingFields, newGroupingFields)) {
      return;
    }

    const colUpdates: GridColDef[] = newGroupingFields.map((field, fieldIndex) => {
      const col: GridColDef = {
        field,
        groupRows: true,
        groupRowIndex: fieldIndex,
      };

      if (field === colHeaderDragField) {
        // TODO: Allow to hide a col during its drag
        // col.hide = true
      }

      return col;
    });

    apiRef.current.updateColumns(colUpdates);
  };

  const handleRemoveGroupingCol = (field: string) =>
    apiRef.current.updateColumn({
      ...apiRef.current.getColumn(field),
      hide: false,
      groupRows: false,
      groupRowIndex: undefined,
    });

  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragStart, handleColumnReorderStart);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragEnd, handleColumnReorderStop);

  return (
    <GridGroupRowByColumnPanelRoot>
      {groupingFields.map((field) => {
        const label = groupingColumns[field].headerName ?? field;

        return (
          <GridGroupingChipContainer key={field} onDragEnter={() => handleDragEnter(field)}>
            <Chip label={label} onDelete={() => handleRemoveGroupingCol(field)} />
          </GridGroupingChipContainer>
        );
      })}
      <GridGroupingEmptySpace onDragEnter={() => handleDragEnter(null)} />
    </GridGroupRowByColumnPanelRoot>
  );
};
