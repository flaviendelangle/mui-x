import { CalendarPickerProps } from '../CalendarPicker';
import { CalendarPickerSkeletonProps } from '../CalendarPickerSkeleton';
import { ClockPickerProps } from '../ClockPicker';
import { DatePickerProps } from '../DatePicker';
import { DateRangePickerDayProps } from '../DateRangePickerDay/DateRangePickerDay';
import { DateTimePickerProps } from '../DateTimePicker';
import { DesktopDateTimePickerProps } from '../DesktopDateTimePicker';
import { DesktopTimePickerProps } from '../DesktopTimePicker';
import { MobileDatePickerProps } from '../MobileDatePicker';
import { MobileDateTimePickerProps } from '../MobileDateTimePicker';
import { MobileTimePickerProps } from '../MobileTimePicker';
import { MonthPickerProps } from '../MonthPicker/MonthPicker';
import { PickersDayProps } from '../PickersDay';
import { StaticDatePickerProps } from '../StaticDatePicker';
import { StaticDateTimePickerProps } from '../StaticDateTimePicker';
import { StaticTimePickerProps } from '../StaticTimePicker';
import { TimePickerProps } from '../TimePicker';
import { YearPickerProps } from '../YearPicker';
import { PickerStaticWrapperProps } from '../internal/components/PickerStaticWrapper/PickerStaticWrapper';

export interface LabComponentsPropsList {
  MuiCalendarPicker: CalendarPickerProps<unknown>;
  MuiCalendarPickerSkeleton: CalendarPickerSkeletonProps;
  MuiClockPicker: ClockPickerProps<unknown>;
  MuiDatePicker: DatePickerProps;
  MuiDateRangePickerDay: DateRangePickerDayProps<unknown>;
  MuiDateTimePicker: DateTimePickerProps;
  MuiDesktopDateTimePicker: DesktopDateTimePickerProps;
  MuiDesktopTimePicker: DesktopTimePickerProps;
  MuiMobileDatePicker: MobileDatePickerProps;
  MuiMobileDateTimePicker: MobileDateTimePickerProps;
  MuiMobileTimePicker: MobileTimePickerProps;
  MuiMonthPicker: MonthPickerProps<unknown>;
  MuiPickersDay: PickersDayProps<unknown>;
  MuiStaticDatePicker: StaticDatePickerProps;
  MuiStaticDateTimePicker: StaticDateTimePickerProps;
  MuiStaticTimePicker: StaticTimePickerProps;
  MuiTimePicker: TimePickerProps;
  MuiYearPicker: YearPickerProps<unknown>;
  MuiPickerStaticWrapper: PickerStaticWrapperProps;
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList extends LabComponentsPropsList {}
}

// disable automatic export
export {};
