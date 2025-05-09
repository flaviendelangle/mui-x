import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import { PickerValidDate } from '../../../../../models';
import { useUtils } from '../../../../hooks/useUtils';
import { HTMLProps } from '../../../base-utils/types';

export function useBaseCalendarDayCell(parameters: useBaseCalendarDayCell.Parameters) {
  const utils = useUtils();
  const { value, format = utils.formats.dayOfMonth, ctx } = parameters;

  const formattedValue = React.useMemo(
    () => utils.formatByString(value, format),
    [utils, value, format],
  );

  const onClick = useEventCallback(() => {
    ctx.selectDay(value);
  });

  const props = React.useMemo<HTMLProps>(
    () => ({
      role: 'gridcell',
      'aria-selected': ctx.isSelected,
      'aria-current': ctx.isCurrent ? 'date' : undefined,
      'aria-colindex': utils.getDayOfWeek(value),
      children: formattedValue,
      disabled: ctx.isDisabled,
      tabIndex: ctx.isTabbable ? 0 : -1,
      onClick,
    }),
    [
      utils,
      value,
      formattedValue,
      ctx.isSelected,
      ctx.isDisabled,
      ctx.isTabbable,
      ctx.isCurrent,
      onClick,
    ],
  );

  return React.useMemo(() => ({ props }), [props]);
}

export namespace useBaseCalendarDayCell {
  export interface Parameters {
    /**
     * The value to select when this cell is clicked.
     */
    value: PickerValidDate;
    /**
     * The format used to display the day.
     * @default utils.formats.dayOfMonth
     */
    format?: string;
    /**
     * The memoized context forwarded by the wrapper component so that this component does not need to subscribe to any context.
     */
    ctx: Context;
  }

  export interface Context {
    isSelected: boolean;
    isDisabled: boolean;
    isInvalid: boolean;
    isTabbable: boolean;
    isCurrent: boolean;
    isStartOfWeek: boolean;
    isEndOfWeek: boolean;
    isOutsideCurrentMonth: boolean;
    selectDay: (date: PickerValidDate) => void;
  }
}
