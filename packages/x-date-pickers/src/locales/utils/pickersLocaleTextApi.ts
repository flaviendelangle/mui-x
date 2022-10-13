import { CalendarPickerView, ClockPickerView, MuiPickersAdapter } from '../../internals/models';

export interface PickersComponentSpecificLocaleText {
  // Toolbar titles
  datePickerDefaultToolbarTitle: string;
  dateTimePickerDefaultToolbarTitle: string;
  timePickerDefaultToolbarTitle: string;
  dateRangePickerDefaultToolbarTitle: string;
}

export interface PickersComponentAgnosticLocaleText<TDate> {
  // Calendar navigation
  previousMonth: string;
  nextMonth: string;

  // View navigation
  openPreviousView: string;
  openNextView: string;
  calendarViewSwitchingButtonAriaLabel: (currentView: CalendarPickerView) => string;
  inputModeToggleButtonAriaLabel: (
    isKeyboardInputOpen: boolean,
    viewType: 'calendar' | 'clock',
  ) => string;

  // DateRange placeholders
  start: string;
  end: string;

  // Action bar
  cancelButtonLabel: string;
  clearButtonLabel: string;
  okButtonLabel: string;
  todayButtonLabel: string;

  // Clock labels
  clockLabelText: (
    view: ClockPickerView,
    time: TDate | null,
    adapter: MuiPickersAdapter<TDate>,
  ) => string;
  hoursClockNumberText: (hours: string) => string;
  minutesClockNumberText: (minutes: string) => string;
  secondsClockNumberText: (seconds: string) => string;

  // Open picker labels
  openDatePickerDialogue: (date: TDate | null, utils: MuiPickersAdapter<TDate>) => string;
  openTimePickerDialogue: (date: TDate | null, utils: MuiPickersAdapter<TDate>) => string;

  // Table labels
  timeTableLabel: string;
  dateTableLabel: string;

  // Field section placeholders
  fieldYearPlaceholder: (params: { digitAmount: number }) => string;
  fieldMonthPlaceholder: (params: { contentType: 'letter' | 'digit' }) => string;
  fieldDayPlaceholder: () => string;
  fieldHoursPlaceholder: () => string;
  fieldMinutesPlaceholder: () => string;
  fieldSecondsPlaceholder: () => string;
  fieldMeridiemPlaceholder: () => string;
}

export interface PickersLocaleText<TDate>
  extends PickersComponentAgnosticLocaleText<TDate>,
    PickersComponentSpecificLocaleText {}

export type PickersInputLocaleText<TDate> = Partial<PickersLocaleText<TDate>>;

/**
 * Translations that can be provided directly to the picker components.
 * It contains some generic translations like `toolbarTitle`
 * which will be dispatched to various translations keys in `PickersLocaleText`, depending on the pickers received them.
 */
export interface PickersInputComponentLocaleText<TDate>
  extends Partial<PickersComponentAgnosticLocaleText<TDate>> {
  toolbarTitle?: string;
}

export type PickersTranslationKeys = keyof PickersLocaleText<any>;

export type LocalizedComponent<
  TDate,
  Props extends { localeText?: PickersInputComponentLocaleText<TDate> },
> = Omit<Props, 'localeText'> & { localeText?: PickersInputLocaleText<TDate> };
