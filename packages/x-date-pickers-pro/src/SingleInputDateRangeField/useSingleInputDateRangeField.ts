'use client';
import * as React from 'react';
import { useField, useLocalizationContext } from '@mui/x-date-pickers/internals';
import { useSplitFieldProps } from '@mui/x-date-pickers/hooks';
import { PickerValidDate } from '@mui/x-date-pickers/models';
import { UseSingleInputDateRangeFieldProps } from './SingleInputDateRangeField.types';
import { getDateRangeValueManager } from '../valueManagers';

export const useSingleInputDateRangeField = <
  TDate extends PickerValidDate,
  TEnableAccessibleFieldDOMStructure extends boolean,
  TAllProps extends UseSingleInputDateRangeFieldProps<TDate, TEnableAccessibleFieldDOMStructure>,
>(
  props: TAllProps,
) => {
  const localizationContext = useLocalizationContext<TDate>();
  const { forwardedProps, internalProps } = useSplitFieldProps(props, 'date');

  const valueManager = React.useMemo(
    () =>
      getDateRangeValueManager<TDate, TEnableAccessibleFieldDOMStructure>({
        enableAccessibleFieldDOMStructure: props.enableAccessibleFieldDOMStructure,
        dateSeparator: props.dateSeparator,
      }),
    [props.enableAccessibleFieldDOMStructure, props.dateSeparator],
  );

  const internalPropsWithDefaults = valueManager.applyDefaultsToFieldInternalProps({
    ...localizationContext,
    internalProps,
  });

  return useField<typeof valueManager, typeof forwardedProps>({
    forwardedProps,
    internalProps: internalPropsWithDefaults,
    valueManager,
  });
};
