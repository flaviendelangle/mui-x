import {
  useField,
  splitFieldInternalAndForwardedProps,
  useDefaultizedDateField,
} from '@mui/x-date-pickers/internals';
import { UseSingleInputDateRangeFieldProps } from './SingleInputDateRangeField.types';
import { rangeValueManager, rangeFieldValueManager } from '../internals/utils/valueManagers';
import { validateDateRange } from '../internals/utils/validation/validateDateRange';
import { DateRange } from '../internals/models';
import { RangeFieldSection } from '../models';

export const useSingleInputDateRangeField = <
  TDate,
  TUseV6TextField extends boolean,
  TAllProps extends UseSingleInputDateRangeFieldProps<TDate, TUseV6TextField>,
>(
  inProps: TAllProps,
) => {
  const props = useDefaultizedDateField<
    TDate,
    UseSingleInputDateRangeFieldProps<TDate, TUseV6TextField>,
    TAllProps
  >(inProps);

  const { forwardedProps, internalProps } = splitFieldInternalAndForwardedProps<
    typeof props,
    keyof UseSingleInputDateRangeFieldProps<TDate, TUseV6TextField>
  >(props, 'date');

  return useField<
    DateRange<TDate>,
    TDate,
    RangeFieldSection,
    TUseV6TextField,
    typeof forwardedProps,
    typeof internalProps
  >({
    forwardedProps,
    internalProps,
    valueManager: rangeValueManager,
    fieldValueManager: rangeFieldValueManager,
    validator: validateDateRange,
    valueType: 'date',
  });
};
