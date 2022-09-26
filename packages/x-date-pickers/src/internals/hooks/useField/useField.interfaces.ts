import * as React from 'react';
import { MuiDateSectionName, MuiPickerFieldAdapter } from '../../models';
import { PickerStateValueManager } from '../usePickerState';
import { InferError, Validator } from '../validation/useValidation';

export interface UseFieldParams<
  TValue,
  TDate,
  TSection extends FieldSection,
  TForwardedProps extends UseFieldForwardedProps,
  TInternalProps extends UseFieldInternalProps<any, any>,
> {
  inputRef?: React.Ref<HTMLInputElement>;
  forwardedProps: TForwardedProps;
  internalProps: TInternalProps;
  valueManager: PickerStateValueManager<TValue, TDate>;
  fieldValueManager: FieldValueManager<TValue, TDate, TSection, InferError<TInternalProps>>;
  validator: Validator<
    TValue,
    TDate,
    InferError<TInternalProps>,
    UseFieldValidationProps<TValue, TInternalProps>
  >;
}

export interface UseFieldInternalProps<TValue, TError> {
  value?: TValue;
  onChange?: (value: TValue) => void;
  onError?: (error: TError, value: TValue) => void;
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: TValue;
  format?: string;
  /**
   * It prevents the user from changing the value of the field
   * (not from interacting with the field).
   * @default false
   */
  readOnly?: boolean;
}

export interface UseFieldForwardedProps {
  onKeyDown?: React.KeyboardEventHandler;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export type UseFieldResponse<TForwardedProps extends UseFieldForwardedProps> = Omit<
  TForwardedProps,
  keyof UseFieldForwardedProps
> &
  Required<UseFieldForwardedProps> & {
    ref: React.Ref<HTMLInputElement>;
    value: string;
    onChange: () => void;
    error: boolean;
  };

export interface FieldSection {
  start: number;
  end: number;
  value: string;
  emptyValue: string;
  separator: string | null;
  dateSectionName: MuiDateSectionName;
  formatValue: string;
  query: string | null;
}

export interface FieldValueManager<TValue, TDate, TSection extends FieldSection, TError> {
  getSectionsFromValue: (
    utils: MuiPickerFieldAdapter<TDate>,
    prevSections: TSection[] | null,
    value: TValue,
    format: string,
  ) => TSection[];
  getValueStrFromSections: (sections: TSection[]) => string;
  getValueFromSections: (
    utils: MuiPickerFieldAdapter<TDate>,
    prevSections: TSection[],
    sections: TSection[],
    format: string,
  ) => { value: TValue; shouldPublish: boolean };
  getActiveDateFromActiveSection: (
    value: TValue,
    activeSection: TSection,
  ) => { value: TDate | null; update: (newActiveDate: TDate | null) => TValue };
  hasError: (error: TError) => boolean;
  isSameError: (error: TError, prevError: TError | null) => boolean;
}

export interface UseFieldState<TValue, TSections> {
  value: TValue;
  sections: TSections;
  selectedSectionIndexes: { start: number; end: number } | null;
}

export type UseFieldValidationProps<
  TValue,
  TInternalProps extends UseFieldInternalProps<any, any>,
> = Omit<TInternalProps, 'value' | 'defaultValue'> & { value: TValue };

export type AvailableAdjustKeyCode =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'PageUp'
  | 'PageDown'
  | 'Home'
  | 'End';
