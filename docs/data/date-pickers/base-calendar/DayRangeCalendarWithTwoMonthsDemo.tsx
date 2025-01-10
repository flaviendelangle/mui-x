import * as React from 'react';
import clsx from 'clsx';
import { Dayjs } from 'dayjs';
import { Separator } from '@base-ui-components/react/separator';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// eslint-disable-next-line no-restricted-imports
import {
  RangeCalendar,
  useRangeCalendarContext,
} from '@mui/x-date-pickers-pro/internals/base/RangeCalendar';
import styles from './calendar.module.css';

function Header(props: { offset: 0 | 1 }) {
  const { offset } = props;
  const { visibleDate } = useRangeCalendarContext();

  const date = visibleDate.add(offset, 'month');

  return (
    <header className={styles.Header}>
      <RangeCalendar.SetVisibleMonth
        target="previous"
        className={clsx(styles.SetVisibleMonth, offset === 1 && styles.Hidden)}
      >
        ◀
      </RangeCalendar.SetVisibleMonth>
      <span>{date.format('MMMM YYYY')}</span>
      <RangeCalendar.SetVisibleMonth
        target="next"
        className={clsx(styles.SetVisibleMonth, offset === 0 && styles.Hidden)}
      >
        ▶
      </RangeCalendar.SetVisibleMonth>
    </header>
  );
}

function DaysGrid(props: { offset: 0 | 1 }) {
  const { offset } = props;
  return (
    <div className={styles.Panel}>
      <Header offset={offset} />
      <RangeCalendar.DaysGrid className={styles.DaysGrid} offset={offset}>
        <RangeCalendar.DaysGridHeader className={styles.DaysGridHeader}>
          {({ days }) =>
            days.map((day) => (
              <RangeCalendar.DaysGridHeaderCell
                value={day}
                key={day.toString()}
                className={styles.DaysGridHeaderCell}
              />
            ))
          }
        </RangeCalendar.DaysGridHeader>
        <RangeCalendar.DaysGridBody className={styles.DaysGridBody}>
          {({ weeks }) =>
            weeks.map((week) => (
              <RangeCalendar.DaysWeekRow
                value={week}
                key={week.toString()}
                className={styles.DaysWeekRow}
              >
                {({ days }) =>
                  days.map((day) => (
                    <RangeCalendar.DaysCell
                      value={day}
                      key={day.toString()}
                      className={clsx(styles.DaysCell, styles.RangeDaysCell)}
                    />
                  ))
                }
              </RangeCalendar.DaysWeekRow>
            ))
          }
        </RangeCalendar.DaysGridBody>
      </RangeCalendar.DaysGrid>
    </div>
  );
}

function DayRangeCalendar(props: Omit<RangeCalendar.Root.Props, 'children'>) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <RangeCalendar.Root
        {...props}
        monthPageSize={2}
        className={clsx(styles.Root, styles.RootWithTwoPanels)}
      >
        <DaysGrid offset={0} />
        <Separator className={styles.DaysGridSeparator} />
        <DaysGrid offset={1} />
      </RangeCalendar.Root>
    </LocalizationProvider>
  );
}

export default function DayRangeCalendarWithTwoMonthsDemo() {
  const [value, setValue] = React.useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const handleValueChange = React.useCallback(
    (newValue: [Dayjs | null, Dayjs | null]) => {
      setValue(newValue);
    },
    [],
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DayRangeCalendar value={value} onValueChange={handleValueChange} />
    </LocalizationProvider>
  );
}