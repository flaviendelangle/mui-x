import * as React from 'react';
import { SlotComponentProps } from '@mui/utils';
import TextField from '@mui/material/TextField';
import {
  UseClearableFieldSlots,
  UseClearableFieldSlotProps,
  ExportedUseClearableFieldProps,
} from '../hooks/useClearableField';
import {
  DateValidationError,
  PickerValidDate,
  BuiltInFieldTextFieldProps,
  BaseSingleInputFieldProps,
} from '../models';
import { DefaultizedProps } from '../internals/models/helpers';
import { BaseDateValidationProps } from '../internals/models/validation';
import { DateFieldInternalProps } from '../valueManagers';

export interface UseDateFieldProps<
  TDate extends PickerValidDate,
  TEnableAccessibleFieldDOMStructure extends boolean,
> extends DateFieldInternalProps<TDate, TEnableAccessibleFieldDOMStructure>,
    ExportedUseClearableFieldProps {}

/**
 * Props the field can receive when used inside a date picker.
 * (`DatePicker`, `DesktopDatePicker` or `MobileDatePicker` component).
 */
export type DateFieldInPickerProps<
  TDate extends PickerValidDate,
  TEnableAccessibleFieldDOMStructure extends boolean,
> = DefaultizedProps<
  UseDateFieldProps<TDate, TEnableAccessibleFieldDOMStructure>,
  'format' | 'timezone' | keyof BaseDateValidationProps<TDate>
> &
  BaseSingleInputFieldProps<TDate, false, TEnableAccessibleFieldDOMStructure, DateValidationError>;

export type UseDateFieldComponentProps<
  TDate extends PickerValidDate,
  TEnableAccessibleFieldDOMStructure extends boolean,
  TChildProps extends {},
> = Omit<TChildProps, keyof UseDateFieldProps<TDate, TEnableAccessibleFieldDOMStructure>> &
  UseDateFieldProps<TDate, TEnableAccessibleFieldDOMStructure>;

export type DateFieldProps<
  TDate extends PickerValidDate,
  TEnableAccessibleFieldDOMStructure extends boolean = false,
> = UseDateFieldComponentProps<
  TDate,
  TEnableAccessibleFieldDOMStructure,
  BuiltInFieldTextFieldProps<TEnableAccessibleFieldDOMStructure>
> & {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: DateFieldSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: DateFieldSlotProps<TDate, TEnableAccessibleFieldDOMStructure>;
};

export type DateFieldOwnerState<
  TDate extends PickerValidDate,
  TEnableAccessibleFieldDOMStructure extends boolean,
> = DateFieldProps<TDate, TEnableAccessibleFieldDOMStructure>;

export interface DateFieldSlots extends UseClearableFieldSlots {
  /**
   * Form control with an input to render the value.
   * @default TextField from '@mui/material' or PickersTextField if `enableAccessibleFieldDOMStructure` is `true`.
   */
  textField?: React.ElementType;
}

export interface DateFieldSlotProps<
  TDate extends PickerValidDate,
  TEnableAccessibleFieldDOMStructure extends boolean,
> extends UseClearableFieldSlotProps {
  textField?: SlotComponentProps<
    typeof TextField,
    {},
    DateFieldOwnerState<TDate, TEnableAccessibleFieldDOMStructure>
  >;
}
