import { SxProps } from '@mui/material/styles';
import { MakeRequired } from '@mui/x-internals/types';
import type { FieldSection, PickerOwnerState } from '../../models';
import type { UseFieldInternalProps } from '../hooks/useField';
import { RangePosition } from './pickers';
import { PickerValidValue } from './value';
import type {
  ExportedPickerFieldUIProps,
  ExportedPickerFieldUISlots,
  PickerFieldUISlotProps,
} from '../components/PickerFieldUI';

export interface FieldRangeSection extends FieldSection {
  dateName: RangePosition;
}

export interface BaseForwardedSingleInputFieldProps
  extends Pick<ExportedPickerFieldUIProps, 'clearable' | 'onClear'> {
  className: string | undefined;
  sx: SxProps<any> | undefined;
  label: React.ReactNode | undefined;
  name: string | undefined;
  id?: string;
  focused?: boolean;
  onKeyDown?: React.KeyboardEventHandler;
  onBlur?: React.FocusEventHandler;
  ref?: React.Ref<HTMLDivElement>;
  inputRef?: React.Ref<HTMLInputElement>;
  inputProps?: {
    'aria-label'?: string;
  };
  slots?: ExportedPickerFieldUISlots;
  slotProps?: PickerFieldUISlotProps & {
    textField?: {};
  };
  ownerState: PickerOwnerState;
}

/**
 * Props the single input field can receive when used inside a picker.
 * Only contains what the MUI components are passing to the field, not what users can pass using the `props.slotProps.field`.
 */
export type BaseSingleInputFieldProps<
  TValue extends PickerValidValue,
  TEnableAccessibleFieldDOMStructure extends boolean,
  TError,
> = MakeRequired<
  Pick<
    UseFieldInternalProps<TValue, TEnableAccessibleFieldDOMStructure, TError>,
    | 'readOnly'
    | 'disabled'
    | 'format'
    | 'formatDensity'
    | 'enableAccessibleFieldDOMStructure'
    | 'selectedSections'
    | 'onSelectedSectionsChange'
    | 'timezone'
    | 'value'
    | 'onChange'
    | 'unstableFieldRef'
    | 'autoFocus'
  >,
  'format' | 'value' | 'onChange' | 'timezone'
> &
  BaseForwardedSingleInputFieldProps;
