import * as React from 'react';
import { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// eslint-disable-next-line no-restricted-imports
import {
  Calendar,
  useCalendarContext,
} from '@mui/x-date-pickers/internals/base/Calendar';
import styles from './calendar.module.css';

function Header() {
  const { visibleDate } = useCalendarContext();

  return (
    <header className={styles.Header}>
      <Calendar.SetVisibleMonth target="previous" className={styles.SetVisibleMonth}>
        ◀
      </Calendar.SetVisibleMonth>
      <span>{visibleDate.format('MMMM YYYY')}</span>
      <Calendar.SetVisibleMonth target="next" className={styles.SetVisibleMonth}>
        ▶
      </Calendar.SetVisibleMonth>
    </header>
  );
}

function DayCalendar(props: Omit<Calendar.Root.Props, 'children'>) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Calendar.Root {...props} className={styles.Root}>
        <Header />
        <Calendar.DaysGrid className={styles.DaysGrid}>
          <Calendar.DaysGridHeader className={styles.DaysGridHeader}>
            {({ days }) =>
              days.map((day) => (
                <Calendar.DaysGridHeaderCell
                  value={day}
                  key={day.toString()}
                  className={styles.DaysGridHeaderCell}
                />
              ))
            }
          </Calendar.DaysGridHeader>
          <Calendar.DaysGridBody className={styles.DaysGridBody}>
            {({ weeks }) =>
              weeks.map((week) => (
                <Calendar.DaysWeekRow
                  value={week}
                  key={week.toString()}
                  className={styles.DaysWeekRow}
                >
                  {({ days }) =>
                    days.map((day) => (
                      <Calendar.DaysCell
                        value={day}
                        key={day.toString()}
                        className={styles.DaysCell}
                      />
                    ))
                  }
                </Calendar.DaysWeekRow>
              ))
            }
          </Calendar.DaysGridBody>
        </Calendar.DaysGrid>
      </Calendar.Root>
    </LocalizationProvider>
  );
}

export default function DayCalendarDemo() {
  const [value, setValue] = React.useState<Dayjs | null>(null);

  const handleValueChange = React.useCallback((newValue: Dayjs | null) => {
    setValue(newValue);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DayCalendar value={value} onValueChange={handleValueChange} />
    </LocalizationProvider>
  );
}