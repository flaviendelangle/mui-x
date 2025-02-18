import * as React from 'react';
import useForkRef from '@mui/utils/useForkRef';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { useUtils } from '../../../../hooks/useUtils';
import { useBaseCalendarRootContext } from '../root/BaseCalendarRootContext';
import type { useBaseCalendarDayCell } from './useBaseCalendarDayCell';
import { useBaseCalendarDayGridRowContext } from '../day-grid-row/BaseCalendarDayGridRowContext';
import { useBaseCalendarDayGridBodyContext } from '../day-grid-body/BaseCalendarDayGridBodyContext';

export function useBaseCalendarDayCellWrapper(
  parameters: useBaseCalendarDayCellWrapper.Parameters,
): useBaseCalendarDayCellWrapper.ReturnValue {
  const { forwardedRef, value } = parameters;
  const baseRootContext = useBaseCalendarRootContext();
  const baseDayGridBodyContext = useBaseCalendarDayGridBodyContext();
  const baseDayGridRowContext = useBaseCalendarDayGridRowContext();
  const ref = React.useRef<HTMLButtonElement>(null);
  const utils = useUtils();
  const mergedRef = useForkRef(forwardedRef, ref);

  const isSelected = React.useMemo(
    () => baseRootContext.selectedDates.some((date) => utils.isSameDay(date, value)),
    [baseRootContext.selectedDates, value, utils],
  );

  const isCurrent = React.useMemo(() => utils.isSameDay(value, utils.date()), [utils, value]);

  const isStartOfWeek = React.useMemo(
    () => utils.isSameDay(value, utils.startOfWeek(value)),
    [utils, value],
  );

  const isEndOfWeek = React.useMemo(
    () => utils.isSameDay(value, utils.endOfWeek(value)),
    [utils, value],
  );

  const isOutsideCurrentMonth = React.useMemo(
    () =>
      baseDayGridBodyContext.currentMonth == null
        ? false
        : !utils.isSameMonth(baseDayGridBodyContext.currentMonth, value),
    [baseDayGridBodyContext.currentMonth, value, utils],
  );

  const isDateInvalid = baseRootContext.isDateInvalid;
  const isInvalid = React.useMemo(() => isDateInvalid(value), [value, isDateInvalid]);

  const isDisabled = React.useMemo(() => {
    if (baseRootContext.disabled) {
      return true;
    }

    return isInvalid;
  }, [baseRootContext.disabled, isInvalid]);

  const isTabbable = React.useMemo(
    () =>
      !isOutsideCurrentMonth &&
      baseDayGridBodyContext.tabbableDays.some((day) => utils.isSameDay(day, value)),
    [utils, isOutsideCurrentMonth, baseDayGridBodyContext.tabbableDays, value],
  );

  const ctx = React.useMemo<useBaseCalendarDayCell.Context>(
    () => ({
      isSelected,
      isDisabled,
      isInvalid,
      isTabbable,
      isCurrent,
      isStartOfWeek,
      isEndOfWeek,
      isOutsideCurrentMonth,
      selectDay: baseDayGridBodyContext.selectDay,
    }),
    [
      isSelected,
      isDisabled,
      isInvalid,
      isTabbable,
      isStartOfWeek,
      isEndOfWeek,
      isCurrent,
      isOutsideCurrentMonth,
      baseDayGridBodyContext.selectDay,
    ],
  );

  const registerDayGridCell = baseRootContext.registerDayGridCell;
  useEnhancedEffect(() => {
    return registerDayGridCell({
      cell: ref,
      row: baseDayGridRowContext.ref,
      grid: baseDayGridBodyContext.ref,
    });
  }, [baseDayGridBodyContext.ref, baseDayGridRowContext.ref, registerDayGridCell]);

  return {
    ref: mergedRef,
    ctx,
  };
}

export namespace useBaseCalendarDayCellWrapper {
  export interface Parameters extends Pick<useBaseCalendarDayCell.Parameters, 'value'> {
    /**
     * The ref forwarded by the parent component.
     */
    forwardedRef: React.ForwardedRef<HTMLButtonElement>;
  }

  export interface ReturnValue {
    /**
     * The ref to forward to the component.
     */
    ref: React.RefCallback<HTMLButtonElement> | null;
    /**
     * The memoized context to forward to the memoized component so that it does not need to subscribe to any context.
     */
    ctx: useBaseCalendarDayCell.Context;
  }
}
