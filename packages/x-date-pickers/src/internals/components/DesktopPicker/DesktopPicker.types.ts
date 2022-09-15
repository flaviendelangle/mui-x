import * as React from 'react';
import { CalendarOrClockPickerView, MuiPickersAdapter } from '../../models';
import { PickerStateProps2 } from '../../hooks/usePickerState2';
import { PickerViewManagerProps } from '../PickerViewManager';
import { PickerStateValueManager } from '../../hooks/usePickerState';
import { PickersPopperSlotsComponent, PickersPopperSlotsComponentsProps } from '../PickersPopper';

export interface DesktopPickerSlotsComponent extends PickersPopperSlotsComponent {
  Field: React.ElementType;
  /**
   * Icon displayed in the open picker button.
   */
  OpenPickerIcon: React.ElementType;
  Input?: React.ElementType;
  /**
   * Button to open the picker.
   * @default IconButton
   */
  OpenPickerButton?: React.ElementType;
}

// TODO: Type props of all slots
export interface DesktopPickerSlotsComponentsProps extends PickersPopperSlotsComponentsProps {
  field?: Record<string, any>;
  input?: Record<string, any>;
  openPickerIcon?: Record<string, any>;
  openPickerButton?: Record<string, any>;
}

export interface DesktopPickerProps<TValue, TDate, TView extends CalendarOrClockPickerView>
  extends PickerStateProps2<TValue>,
    Omit<PickerViewManagerProps<TValue, TDate, TView>, 'value' | 'onChange'> {
  /**
   * Class name applied to the root element.
   */
  className?: string;
  valueManager: PickerStateValueManager<TValue, TValue, TDate>;
  /**
   * Overrideable components.
   * @default {}
   */
  components: DesktopPickerSlotsComponent;
  /**
   * The props used for each component slot.
   * @default {}
   */
  componentsProps?: DesktopPickerSlotsComponentsProps;
  /**
   * Get aria-label text for control that opens picker dialog. Aria-label text must include selected date. @DateIOType
   * @template TInputDate, TDate
   * @param {TInputDate} date The date from which we want to add an aria-text.
   * @param {MuiPickersAdapter<TDate>} utils The utils to manipulate the date.
   * @returns {string} The aria-text to render inside the dialog.
   * @default (date, utils) => `Choose date, selected date is ${utils.format(utils.date(date), 'fullDate')}`
   */
  getOpenDialogAriaText: (date: TDate, utils: MuiPickersAdapter<TDate>) => string;
  /**
   * Format of the date when rendered in the input(s).
   */
  inputFormat: string;
  /**
   * Do not render open picker button (renders only the field).
   * @default false
   */
  disableOpenPicker?: boolean;
}

export interface ExportedDesktopPickerProps<TValue, TDate, TView extends CalendarOrClockPickerView>
  extends Omit<
    DesktopPickerProps<TValue, TDate, TView>,
    'valueManager' | 'renderViews' | 'components' | 'componentsProps' | 'getOpenDialogAriaText'
  > {}
