'use client';
import * as React from 'react';
import { DateValidationError } from '../../../../models';
import { useRenderElement } from '../../base-utils/useRenderElement';
import { BaseUIComponentProps } from '../../base-utils/types';
import { BaseCalendarRootContext } from '../../utils/base-calendar/root/BaseCalendarRootContext';
import { useBaseCalendarRoot } from '../../utils/base-calendar/root/useBaseCalendarRoot';
import { useCalendarRoot } from './useCalendarRoot';
import { BaseCalendarRootVisibleDateContext } from '../../utils/base-calendar/root/BaseCalendarRootVisibleDateContext';

const CalendarRoot = React.forwardRef(function CalendarRoot(
  componentProps: CalendarRoot.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    // Rendering props
    className,
    render,
    // Form props
    readOnly,
    disabled,
    // Focus and navigation props
    monthPageSize,
    yearPageSize,
    // Value props
    onValueChange,
    defaultValue,
    value,
    timezone,
    referenceDate,
    // Visible date props
    onVisibleDateChange,
    visibleDate,
    defaultVisibleDate,
    // Children
    children,
    // Validation props
    onError,
    minDate,
    maxDate,
    disablePast,
    disableFuture,
    shouldDisableDate,
    shouldDisableMonth,
    shouldDisableYear,
    // Props forwarded to the DOM element
    ...elementProps
  } = componentProps;

  const { getRootProps, baseContext, visibleDateContext, isEmpty } = useCalendarRoot({
    readOnly,
    disabled,
    monthPageSize,
    yearPageSize,
    onValueChange,
    defaultValue,
    value,
    timezone,
    referenceDate,
    onVisibleDateChange,
    visibleDate,
    defaultVisibleDate,
    onError,
    shouldDisableDate,
    shouldDisableMonth,
    shouldDisableYear,
    disablePast,
    disableFuture,
    minDate,
    maxDate,
    children,
  });

  const state: CalendarRoot.State = React.useMemo(() => ({ empty: isEmpty }), [isEmpty]);

  const renderElement = useRenderElement('div', componentProps, {
    state,
    ref: forwardedRef,
    props: [getRootProps, elementProps],
  });

  return (
    <BaseCalendarRootVisibleDateContext.Provider value={visibleDateContext}>
      <BaseCalendarRootContext.Provider value={baseContext}>
        {renderElement()}
      </BaseCalendarRootContext.Provider>
    </BaseCalendarRootVisibleDateContext.Provider>
  );
});

export namespace CalendarRoot {
  export interface State {}

  export interface Props
    extends useCalendarRoot.Parameters,
      Omit<BaseUIComponentProps<'div', State>, 'value' | 'defaultValue' | 'onError' | 'children'> {}

  export interface ValueChangeHandlerContext
    extends useBaseCalendarRoot.ValueChangeHandlerContext<DateValidationError> {}
}

export { CalendarRoot };
