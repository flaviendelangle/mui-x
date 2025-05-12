'use client';
import * as React from 'react';
import { BaseUIComponentProps } from '../../base-utils/types';
import { useRenderElement } from '../../base-utils/useRenderElement';
import { useBaseCalendarDayCellWrapper } from '../../utils/base-calendar/day-cell/useBaseCalendarDayCellWrapper';
import { useBaseCalendarDayCell } from '../../utils/base-calendar/day-cell/useBaseCalendarDayCell';
import { CustomStyleHookMapping } from '../../base-utils/getStyleHookProps';
import { CalendarDayCellDataAttributes } from './CalendarDayCellDataAttributes';

const customStyleHookMapping: CustomStyleHookMapping<CalendarDayCell.State> = {
  selected(value) {
    return value ? { [CalendarDayCellDataAttributes.selected]: '' } : null;
  },
  disabled(value) {
    return value ? { [CalendarDayCellDataAttributes.disabled]: '' } : null;
  },
  invalid(value) {
    return value ? { [CalendarDayCellDataAttributes.invalid]: '' } : null;
  },
  current(value) {
    return value ? { [CalendarDayCellDataAttributes.current]: '' } : null;
  },
  startOfWeek(value) {
    return value ? { [CalendarDayCellDataAttributes.startOfWeek]: '' } : null;
  },
  endOfWeek(value) {
    return value ? { [CalendarDayCellDataAttributes.endOfWeek]: '' } : null;
  },
  outsideMonth(value) {
    return value ? { [CalendarDayCellDataAttributes.outsideMonth]: '' } : null;
  },
};

const InnerCalendarDayCell = React.forwardRef(function InnerCalendarDayCell(
  componentProps: InnerCalendarDayCellProps,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const { className, render, value, ctx, ...elementProps } = componentProps;
  const { props } = useBaseCalendarDayCell({ value, ctx });

  const state: CalendarDayCell.State = React.useMemo(
    () => ({
      selected: ctx.isSelected,
      disabled: ctx.isDisabled,
      invalid: ctx.isInvalid,
      current: ctx.isCurrent,
      startOfWeek: ctx.isStartOfWeek,
      endOfWeek: ctx.isEndOfWeek,
      outsideMonth: ctx.isOutsideCurrentMonth,
    }),
    [
      ctx.isSelected,
      ctx.isDisabled,
      ctx.isInvalid,
      ctx.isCurrent,
      ctx.isStartOfWeek,
      ctx.isEndOfWeek,
      ctx.isOutsideCurrentMonth,
    ],
  );

  const renderElement = useRenderElement('button', componentProps, {
    state,
    ref: forwardedRef,
    props: [props, elementProps],
    customStyleHookMapping,
  });

  return renderElement();
});

const MemoizedInnerCalendarDayCell = React.memo(InnerCalendarDayCell);

const CalendarDayCell = React.forwardRef(function CalendarDayCell(
  props: CalendarDayCell.Props,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const { ref, ctx } = useBaseCalendarDayCellWrapper({ value: props.value, forwardedRef });

  return <MemoizedInnerCalendarDayCell ref={ref} {...props} ctx={ctx} />;
});

export namespace CalendarDayCell {
  export interface State {
    /**
     * Whether the day is selected.
     */
    selected: boolean;
    /**
     * Whether the day is disabled.
     */
    disabled: boolean;
    /**
     * Whether the day is invalid.
     */
    invalid: boolean;
    /**
     * Whether the day contains the current date.
     */
    current: boolean;
    /**
     * Whether the day is the first day of its week.
     */
    startOfWeek: boolean;
    /**
     * Whether the day is the last day of its week.
     */
    endOfWeek: boolean;
    /**
     * Whether the day is outside the month rendered by the day grid wrapping it.
     */
    outsideMonth: boolean;
  }

  export interface Props
    extends Omit<BaseUIComponentProps<'button', State>, 'value'>,
      useBaseCalendarDayCell.PublicParameters {}
}

interface InnerCalendarDayCellProps extends CalendarDayCell.Props {
  /**
   * The memoized context forwarded by the wrapper component so that this component does not need to subscribe to any context.
   */
  ctx: InnerCalendarDayCellContext;
}

interface InnerCalendarDayCellContext extends useBaseCalendarDayCell.Context {}

export { CalendarDayCell };
