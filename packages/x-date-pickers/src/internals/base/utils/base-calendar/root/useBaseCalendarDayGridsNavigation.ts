import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import useTimeout from '@mui/utils/useTimeout';
import { PickerValidDate } from '../../../../../models';
import { ValidateDateProps } from '../../../../../validation';
import { useUtils } from '../../../../hooks/useUtils';
import {
  applyInitialFocusInGrid,
  navigateInGrid,
  NavigateInGridChangePage,
  PageGridNavigationTarget,
} from '../utils/keyboardNavigation';
import { getFirstEnabledMonth, getLastEnabledMonth } from '../../../Calendar/utils/date';
import type { BaseCalendarRootContext } from './BaseCalendarRootContext';

/**
 * This logic needs to be in Calendar.Root to support multiple Calendar.DayGrid.
 * We could introduce a Calendar.MultipleDayGrid component that would handle this logic if we want to avoid having it in Calendar.Root.
 */
export function useBaseCalendarDayGridNavigation(
  parameters: useBaseCalendarDayGridNavigation.Parameters,
) {
  const { visibleDate, setVisibleDate, monthPageSize, dateValidationProps } = parameters;
  const utils = useUtils();
  const cellsRef = React.useRef(new Map<number, useBaseCalendarDayGridNavigation.CellRefs>());
  const pageNavigationTargetRef = React.useRef<PageGridNavigationTarget | null>(null);

  const timeout = useTimeout();
  React.useEffect(() => {
    if (pageNavigationTargetRef.current) {
      const target = pageNavigationTargetRef.current;
      timeout.start(0, () => {
        const cells = getCellsInCalendar(cellsRef);
        applyInitialFocusInGrid({ cells, target });
      });
    }
  }, [visibleDate, timeout]);

  const applyDayGridKeyboardNavigation = useEventCallback((event: React.KeyboardEvent) => {
    const changePage: NavigateInGridChangePage = (params) => {
      // TODO: Jump over months with no valid date.
      if (params.direction === 'previous') {
        const targetDate = utils.addMonths(utils.startOfMonth(visibleDate), -monthPageSize);
        const lastMonthInNewPage = utils.addMonths(targetDate, monthPageSize - 1);

        // All the months before the visible ones are fully disabled, we skip the navigation.
        if (utils.isAfter(getFirstEnabledMonth(utils, dateValidationProps), lastMonthInNewPage)) {
          return;
        }

        setVisibleDate(utils.addMonths(visibleDate, -monthPageSize));
      }
      if (params.direction === 'next') {
        const targetDate = utils.addMonths(utils.startOfMonth(visibleDate), monthPageSize);

        // All the months after the visible ones are fully disabled, we skip the navigation.
        if (utils.isBefore(getLastEnabledMonth(utils, dateValidationProps), targetDate)) {
          return;
        }
        setVisibleDate(utils.addMonths(visibleDate, monthPageSize));
      }

      pageNavigationTargetRef.current = params.target;
    };
    const cells = getCellsInCalendar(cellsRef);
    navigateInGrid({ cells, event, changePage });
  });

  const registerDayGridCell = useEventCallback(
    (refs: useBaseCalendarDayGridNavigation.CellRefs) => {
      const id = Math.random();
      cellsRef.current.set(id, refs);
      return () => cellsRef.current.delete(id);
    },
  );

  return {
    registerDayGridCell,
    applyDayGridKeyboardNavigation,
  };
}

export namespace useBaseCalendarDayGridNavigation {
  export interface Parameters {
    visibleDate: PickerValidDate;
    setVisibleDate: (visibleDate: PickerValidDate) => void;
    monthPageSize: number;
    dateValidationProps: ValidateDateProps;
  }

  export interface ReturnValue
    extends Pick<
      BaseCalendarRootContext,
      'registerDayGridCell' | 'applyDayGridKeyboardNavigation'
    > {}

  export interface CellRefs {
    cell: React.RefObject<HTMLButtonElement | null>;
    row: React.RefObject<HTMLDivElement | null>;
    grid: React.RefObject<HTMLElement | null>;
  }
}

/* eslint-disable no-bitwise */
const createSortByDocumentPosition =
  <T>(getDOMElement: (element: T) => HTMLElement) =>
  (a: T, b: T) => {
    const aElement = getDOMElement(a);
    const bElement = getDOMElement(b);
    const position = aElement.compareDocumentPosition(bElement);

    if (
      position & Node.DOCUMENT_POSITION_FOLLOWING ||
      position & Node.DOCUMENT_POSITION_CONTAINED_BY
    ) {
      return -1;
    }

    if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
      return 1;
    }

    return 0;
  };
/* eslint-enable no-bitwise */

function getCellsInCalendar(
  cellsRef: React.RefObject<Map<number, useBaseCalendarDayGridNavigation.CellRefs>>,
) {
  const grids: {
    element: HTMLElement;
    rows: { element: HTMLElement; cells: HTMLButtonElement[] }[];
  }[] = [];

  for (const [, cellRefs] of cellsRef.current) {
    if (cellRefs.cell.current && cellRefs.row.current && cellRefs.grid.current) {
      let cellGrid = grids.find((grid) => grid.element === cellRefs.grid.current);
      if (!cellGrid) {
        cellGrid = { element: cellRefs.grid.current, rows: [] };
        grids.push(cellGrid);
      }

      let cellRow = cellGrid.rows.find((row) => row.element === cellRefs.row.current);
      if (!cellRow) {
        cellRow = { element: cellRefs.row.current, cells: [] };
        cellGrid.rows.push(cellRow);
      }

      cellRow.cells.push(cellRefs.cell.current);
    }
  }

  return grids
    .sort(createSortByDocumentPosition((grid) => grid.element))
    .map((grid) =>
      grid.rows
        .sort(createSortByDocumentPosition((row) => row.element))
        .map((row) => row.cells.sort(createSortByDocumentPosition((cell) => cell))),
    );
}
