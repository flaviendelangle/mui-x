import * as React from 'react';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import { useGridApiEventHandler } from '../hooks/utils/useGridApiEventHandler';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useGridSelector } from '../hooks/utils/useGridSelector';
import { GridEventListener, GridEvents } from '../models/events';
import { gridGroupingRowsSanitizedModelSelector } from '../hooks/features/groupingColumns';
import { gridColumnLookupSelector } from '../hooks/features/columns';
import { GridDragIcon } from './icons';

const GridGroupingColumnsPanelRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'GroupingColumnsPanel',
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
 */
export const GridGroupingColumnsPanel = () => {
  const apiRef = useGridApiContext();
  const [colHeaderDragField, setColHeaderDragField] = React.useState('');
  const [chipDragField, setChipDragField] = React.useState('');
  const groupingColumnsModel = useGridSelector(apiRef, gridGroupingRowsSanitizedModelSelector);
  const columnsLookup = useGridSelector(apiRef, gridColumnLookupSelector);
  const handleColumnReorderStart = React.useCallback<
    GridEventListener<GridEvents.columnHeaderDragStart>
  >((params) => setColHeaderDragField(params.field), []);

  const handleColumnReorderStop = React.useCallback<
    GridEventListener<GridEvents.columnHeaderDragEnd>
  >(() => setColHeaderDragField(''), []);

  const handleDragStartChip = (field: string) => setChipDragField(field);

  const handleDragEndChip = () => setChipDragField('');

  const handleDragEnter = (targetField: string | null) => {
    const dragField = colHeaderDragField || chipDragField;

    if (!dragField || targetField === dragField) {
      return;
    }

    const targetIndex =
      targetField == null ? groupingColumnsModel.length : groupingColumnsModel.indexOf(targetField);
    if (groupingColumnsModel.includes(dragField)) {
      apiRef.current.setGroupingCriteriaIndex(dragField, targetIndex);
    } else {
      apiRef.current.addGroupingField(dragField, true, targetIndex);
    }
  };

  const handleRemoveGroupingCol = (field: string) =>
    apiRef.current.removeGroupingField(field, true);

  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragStart, handleColumnReorderStart);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragEnd, handleColumnReorderStop);

  return (
    <GridGroupingColumnsPanelRoot>
      {groupingColumnsModel.map((field) => {
        const label = columnsLookup[field].headerName ?? field;

        return (
          <GridGroupingChipContainer key={field} onDragEnter={() => handleDragEnter(field)}>
            <Chip
              label={label}
              draggable
              onDragStart={() => handleDragStartChip(field)}
              onDragEnd={() => handleDragEndChip()}
              onDelete={() => handleRemoveGroupingCol(field)}
              icon={<GridDragIcon />}
            />
          </GridGroupingChipContainer>
        );
      })}
      <GridGroupingEmptySpace onDragEnter={() => handleDragEnter(null)} />
    </GridGroupingColumnsPanelRoot>
  );
};
