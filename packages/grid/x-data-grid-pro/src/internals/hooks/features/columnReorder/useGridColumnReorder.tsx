import * as React from 'react';
import { unstable_composeClasses as composeClasses } from '@mui/material';
import {
  CursorCoordinates,
  useGridSelector,
  useGridApiEventHandler,
  getDataGridUtilityClass,
  GridEvents,
  GridEventListener,
  useGridLogger,
} from '@mui/x-data-grid/internals';
import { useGridStateInit } from '@mui/x-data-grid/internals/hooks/utils/useGridStateInit';
import { GridApiPro } from '../../../models/gridApiPro';
import { gridColumnReorderDragColSelector } from './columnReorderSelector';
import { DataGridProProcessedProps } from '../../../models/dataGridProProps';

const CURSOR_MOVE_DIRECTION_LEFT = 'left';
const CURSOR_MOVE_DIRECTION_RIGHT = 'right';

const getCursorMoveDirectionX = (
  currentCoordinates: CursorCoordinates,
  nextCoordinates: CursorCoordinates,
) => {
  return currentCoordinates.x <= nextCoordinates.x
    ? CURSOR_MOVE_DIRECTION_RIGHT
    : CURSOR_MOVE_DIRECTION_LEFT;
};

const hasCursorPositionChanged = (
  currentCoordinates: CursorCoordinates,
  nextCoordinates: CursorCoordinates,
): boolean =>
  currentCoordinates.x !== nextCoordinates.x || currentCoordinates.y !== nextCoordinates.y;

type OwnerState = { classes: DataGridProProcessedProps['classes'] };

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    columnHeaderDragging: ['columnHeader--dragging'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

/**
 * Only available in DataGridPro
 * @requires useGridColumns (method)
 */
export const useGridColumnReorder = (
  apiRef: React.MutableRefObject<GridApiPro>,
  props: Pick<DataGridProProcessedProps, 'disableColumnReorder' | 'classes'>,
): void => {
  const logger = useGridLogger(apiRef, 'useGridColumnReorder');

  useGridStateInit(apiRef, (state) => ({
    ...state,
    columnReorder: { dragCol: '' },
  }));

  const dragColField = useGridSelector(apiRef, gridColumnReorderDragColSelector);
  const dragColNode = React.useRef<HTMLElement | null>(null);
  const cursorPosition = React.useRef<CursorCoordinates>({
    x: 0,
    y: 0,
  });
  const originColumnIndex = React.useRef<number | null>(null);
  const removeDnDStylesTimeout = React.useRef<any>();
  const ownerState = { classes: props.classes };
  const classes = useUtilityClasses(ownerState);

  React.useEffect(() => {
    return () => {
      clearTimeout(removeDnDStylesTimeout.current);
    };
  }, []);

  const handleColumnHeaderDragStart = React.useCallback<
    GridEventListener<GridEvents.columnHeaderDragStart>
  >(
    (params, event) => {
      if (props.disableColumnReorder || params.colDef.disableReorder) {
        return;
      }

      logger.debug(`Start dragging col ${params.field}`);
      // Prevent drag events propagation.
      // For more information check here https://github.com/mui/mui-x/issues/2680.
      event.stopPropagation();

      dragColNode.current = event.currentTarget;
      dragColNode.current.classList.add(classes.columnHeaderDragging);

      apiRef.current.setState((state) => ({
        ...state,
        columnReorder: { ...state.columnReorder, dragCol: params.field },
      }));
      apiRef.current.forceUpdate();

      removeDnDStylesTimeout.current = setTimeout(() => {
        dragColNode.current!.classList.remove(classes.columnHeaderDragging);
      });

      originColumnIndex.current = apiRef.current.getColumnIndex(params.field, false);
    },
    [props.disableColumnReorder, classes.columnHeaderDragging, logger, apiRef],
  );

  const handleDragEnter = React.useCallback<
    GridEventListener<GridEvents.cellDragEnter | GridEvents.columnHeaderDragEnter>
  >((params, event) => {
    event.preventDefault();
    // Prevent drag events propagation.
    // For more information check here https://github.com/mui/mui-x/issues/2680.
    event.stopPropagation();
  }, []);

  const handleDragOver = React.useCallback<
    GridEventListener<GridEvents.cellDragOver | GridEvents.columnHeaderDragOver>
  >(
    (params, event) => {
      if (!dragColField) {
        return;
      }

      logger.debug(`Dragging over col ${params.field}`);
      event.preventDefault();
      // Prevent drag events propagation.
      // For more information check here https://github.com/mui/mui-x/issues/2680.
      event.stopPropagation();

      const coordinates = { x: event.clientX, y: event.clientY };

      if (
        params.field !== dragColField &&
        hasCursorPositionChanged(cursorPosition.current, coordinates)
      ) {
        const targetColIndex = apiRef.current.getColumnIndex(params.field, false);
        const targetColVisibleIndex = apiRef.current.getColumnIndex(params.field, true);
        const targetCol = apiRef.current.getColumn(params.field);
        const dragColIndex = apiRef.current.getColumnIndex(dragColField, false);
        const visibleColumns = apiRef.current.getVisibleColumns();

        const cursorMoveDirectionX = getCursorMoveDirectionX(cursorPosition.current, coordinates);
        const hasMovedLeft =
          cursorMoveDirectionX === CURSOR_MOVE_DIRECTION_LEFT && targetColIndex < dragColIndex;
        const hasMovedRight =
          cursorMoveDirectionX === CURSOR_MOVE_DIRECTION_RIGHT && dragColIndex < targetColIndex;

        if (hasMovedLeft || hasMovedRight) {
          let canBeReordered: boolean;
          if (!targetCol.disableReorder) {
            canBeReordered = true;
          } else if (hasMovedLeft) {
            canBeReordered =
              targetColIndex > 0 && !visibleColumns[targetColIndex - 1].disableReorder;
          } else {
            canBeReordered =
              targetColIndex < visibleColumns.length - 1 &&
              !visibleColumns[targetColIndex + 1].disableReorder;
          }

          const canBeReorderedProcessed = apiRef.current.unstable_applyPreProcessors(
            'canBeReordered',
            canBeReordered,
            { targetIndex: targetColVisibleIndex },
          );

          if (canBeReorderedProcessed) {
            apiRef.current.setColumnIndex(dragColField, targetColIndex);
          }
        }

        cursorPosition.current = coordinates;
      }
    },
    [apiRef, dragColField, logger],
  );

  const handleDragEnd = React.useCallback<GridEventListener<GridEvents.columnHeaderDragEnd>>(
    (params, event): void => {
      if (props.disableColumnReorder || !dragColField) {
        return;
      }

      logger.debug('End dragging col');
      event.preventDefault();
      // Prevent drag events propagation.
      // For more information check here https://github.com/mui/mui-x/issues/2680.
      event.stopPropagation();

      clearTimeout(removeDnDStylesTimeout.current);
      dragColNode.current = null;

      // Check if the column was dropped outside the grid.
      if (event.dataTransfer.dropEffect === 'none') {
        // Accessing params.field may contain the wrong field as header elements are reused
        apiRef.current.setColumnIndex(dragColField, originColumnIndex.current!);
        originColumnIndex.current = null;
      }

      apiRef.current.setState((state) => ({
        ...state,
        columnReorder: { ...state.columnReorder, dragCol: '' },
      }));
      apiRef.current.forceUpdate();
    },
    [props.disableColumnReorder, logger, apiRef, dragColField],
  );

  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragStart, handleColumnHeaderDragStart);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragEnter, handleDragEnter);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragOver, handleDragOver);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragEnd, handleDragEnd);
  useGridApiEventHandler(apiRef, GridEvents.cellDragEnter, handleDragEnter);
  useGridApiEventHandler(apiRef, GridEvents.cellDragOver, handleDragOver);
};
