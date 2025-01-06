import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import { PickerValidDate } from '../../../../models';
import { GenericHTMLProps } from '../../utils/types';
import { mergeReactProps } from '../../utils/mergeReactProps';
import { navigateInList } from '../utils/keyboardNavigation';
import { useCalendarMonthCellCollection } from '../utils/month-cell-collection/useCalendarMonthCellCollection';

export function useCalendarMonthsList(parameters: useCalendarMonthsList.Parameters) {
  const { children, loop = true } = parameters;
  const calendarMonthsCellRefs = React.useRef<(HTMLElement | null)[]>([]);
  const { months, context } = useCalendarMonthCellCollection();

  const onKeyDown = useEventCallback((event: React.KeyboardEvent) => {
    navigateInList({
      cells: calendarMonthsCellRefs.current,
      event,
      loop,
    });
  });

  const getMonthListProps = React.useCallback(
    (externalProps: GenericHTMLProps) => {
      return mergeReactProps(externalProps, {
        role: 'radiogroup',
        children: children == null ? null : children({ months }),
        onKeyDown,
      });
    },
    [months, children, onKeyDown],
  );

  return React.useMemo(
    () => ({ getMonthListProps, context, calendarMonthsCellRefs }),
    [getMonthListProps, context, calendarMonthsCellRefs],
  );
}

export namespace useCalendarMonthsList {
  export interface Parameters {
    /**
     * Whether to loop keyboard focus back to the first item
     * when the end of the list is reached while using the arrow keys.
     * @default true
     */
    loop?: boolean;
    children?: (parameters: ChildrenParameters) => React.ReactNode;
  }

  export interface ChildrenParameters {
    months: PickerValidDate[];
  }
}
