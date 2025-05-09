'use client';
import * as React from 'react';
import { BaseUIComponentProps } from '../../base-utils/types';
import { useRenderElement } from '../../base-utils/useRenderElement';
import { getWeekdays } from '../../../utils/date-utils';
import { useUtils } from '../../../hooks/useUtils';
import { PickerValidDate } from '../../../../models';

const CalendarDayGridHeader = React.forwardRef(function CalendarDayGridHeader(
  componentProps: CalendarDayGridHeader.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { className, render, children, ...elementProps } = componentProps;

  const utils = useUtils();

  const days = React.useMemo(() => getWeekdays(utils, utils.date()), [utils]);

  const resolvedChildren = React.useMemo(() => {
    if (!React.isValidElement(children) && typeof children === 'function') {
      return children({ days });
    }

    return children;
  }, [children, days]);

  const props = React.useMemo(
    () => ({
      role: 'row',
      children: resolvedChildren,
    }),
    [resolvedChildren],
  );

  const state = React.useMemo(() => ({}), []);

  const renderElement = useRenderElement('div', componentProps, {
    state,
    ref: forwardedRef,
    props: [props, elementProps],
  });

  return renderElement();
});

export namespace CalendarDayGridHeader {
  export interface State {}

  export interface Props extends Omit<BaseUIComponentProps<'div', State>, 'children'> {
    /**
     * The children of the component.
     * If a function is provided, it will be called with the days of the week as its parameter.
     */
    children?: React.ReactNode | ((parameters: ChildrenParameters) => React.ReactNode);
  }

  export interface ChildrenParameters {
    days: PickerValidDate[];
  }
}

export { CalendarDayGridHeader };
