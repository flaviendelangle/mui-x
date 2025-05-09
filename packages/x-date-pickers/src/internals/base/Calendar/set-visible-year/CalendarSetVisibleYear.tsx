'use client';
import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import useForkRef from '@mui/utils/useForkRef';
import { useRenderElement } from '../../base-utils/useRenderElement';
import { BaseUIComponentProps } from '../../base-utils/types';
import { useUtils } from '../../../hooks/useUtils';
import { useBaseCalendarRootContext } from '../../utils/base-calendar/root/BaseCalendarRootContext';
import { getFirstEnabledYear, getLastEnabledYear } from '../utils/date';
import { useNullableBaseCalendarYearCollectionContext } from '../../utils/base-calendar/utils/BaseCalendarYearCollectionContext';
import { useCompositeListItem } from '../../base-utils/composite/list/useCompositeListItem';
import { useBaseCalendarRootVisibleDateContext } from '../../utils/base-calendar/root/BaseCalendarRootVisibleDateContext';
import { PickerValidDate } from '../../../../models';

const InnerCalendarSetVisibleYear = React.forwardRef(function InnerCalendarSetVisibleYear(
  componentProps: InnerCalendarSetVisibleYearProps,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const { className, render, ctx, target, ...elementProps } = componentProps;

  const props = React.useMemo(
    () => ({
      type: 'button' as const,
      disabled: ctx.isDisabled,
      onClick: ctx.setTarget,
      tabIndex: ctx.isTabbable ? 0 : -1,
    }),
    [ctx.isDisabled, ctx.isTabbable, ctx.setTarget],
  );

  const state: CalendarSetVisibleYear.State = React.useMemo(
    () => ({
      direction: ctx.direction,
    }),
    [ctx.direction],
  );

  const renderElement = useRenderElement('button', componentProps, {
    state,
    ref: forwardedRef,
    props: [props, elementProps],
  });

  return renderElement();
});

const MemoizedInnerCalendarSetVisibleYear = React.memo(InnerCalendarSetVisibleYear);

const CalendarSetVisibleYear = React.forwardRef(function CalendarSetVisibleYear(
  props: CalendarSetVisibleYear.Props,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const baseRootContext = useBaseCalendarRootContext();
  const baseRootVisibleDateContext = useBaseCalendarRootVisibleDateContext();
  const baseYearListOrGridContext = useNullableBaseCalendarYearCollectionContext();
  const utils = useUtils();
  const { ref: listItemRef } = useCompositeListItem();
  const ref = useForkRef(forwardedRef, listItemRef);

  const targetDate = React.useMemo(() => {
    if (props.target === 'previous') {
      return utils.addYears(baseRootVisibleDateContext.visibleDate, -1);
    }

    if (props.target === 'next') {
      return utils.addYears(baseRootVisibleDateContext.visibleDate, 1);
    }

    return utils.setYear(baseRootVisibleDateContext.visibleDate, utils.getYear(props.target));
  }, [baseRootVisibleDateContext.visibleDate, utils, props.target]);

  const isDisabled = React.useMemo(() => {
    if (baseRootContext.disabled) {
      return true;
    }

    const isMovingBefore = utils.isBefore(targetDate, baseRootVisibleDateContext.visibleDate);

    // All the years before the visible ones are fully disabled, we skip the navigation.
    if (isMovingBefore) {
      return utils.isAfter(
        getFirstEnabledYear(utils, baseRootContext.dateValidationProps),
        targetDate,
      );
    }

    // All the years after the visible ones are fully disabled, we skip the navigation.
    return utils.isBefore(
      getLastEnabledYear(utils, baseRootContext.dateValidationProps),
      targetDate,
    );
  }, [
    baseRootContext.disabled,
    baseRootContext.dateValidationProps,
    baseRootVisibleDateContext.visibleDate,
    targetDate,
    utils,
  ]);

  const canCellBeTabbed = baseYearListOrGridContext?.canCellBeTabbed;
  const isTabbable = React.useMemo(() => {
    // If the button is not inside a year list or grid, then it is always tabbable.
    if (canCellBeTabbed == null) {
      return true;
    }

    return canCellBeTabbed(targetDate);
  }, [canCellBeTabbed, targetDate]);

  const setTarget = useEventCallback(() => {
    if (isDisabled) {
      return;
    }
    baseRootContext.setVisibleDate(targetDate, false);
  });

  const direction = React.useMemo(
    () => (utils.isBefore(targetDate, baseRootVisibleDateContext.visibleDate) ? 'before' : 'after'),
    [targetDate, baseRootVisibleDateContext.visibleDate, utils],
  );

  const ctx = React.useMemo<InnerCalendarSetVisibleYearContext>(
    () => ({
      setTarget,
      isDisabled,
      isTabbable,
      direction,
    }),
    [setTarget, isDisabled, isTabbable, direction],
  );

  return <MemoizedInnerCalendarSetVisibleYear ref={ref} {...props} ctx={ctx} />;
});

export namespace CalendarSetVisibleYear {
  export interface State {
    /**
     * The direction of the target year relative to the current visible year.
     * - "before" if the target year is before the current visible year.
     * - "after" if the target year is after the current visible year.
     */
    direction: 'before' | 'after';
  }

  export interface Props extends BaseUIComponentProps<'button', State> {
    /**
     * The year to navigate to.
     */
    target: 'previous' | 'next' | PickerValidDate;
  }
}

interface InnerCalendarSetVisibleYearProps extends CalendarSetVisibleYear.Props {
  /**
   * The memoized context forwarded by the wrapper component so that this component does not need to subscribe to any context.
   */
  ctx: InnerCalendarSetVisibleYearContext;
}

interface InnerCalendarSetVisibleYearContext {
  setTarget: () => void;
  isDisabled: boolean;
  isTabbable: boolean;
  direction: 'before' | 'after';
}

export { CalendarSetVisibleYear };
