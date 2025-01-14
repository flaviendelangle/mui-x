import * as React from 'react';
import clsx from 'clsx';
import { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// eslint-disable-next-line no-restricted-imports
import { Calendar } from '@mui/x-date-pickers/internals/base/Calendar';
import styles from './calendar.module.css';

function DayCalendar(props: Omit<Calendar.Root.Props, 'children'>) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Calendar.Root
        {...props}
        className={clsx(styles.Root, styles.RootWithWeekNumber)}
      >
        {({ visibleDate }) => (
          <React.Fragment>
            <header className={styles.Header}>
              <Calendar.SetVisibleMonth
                target="previous"
                className={styles.SetVisibleMonth}
              >
                ◀
              </Calendar.SetVisibleMonth>
              <span>{visibleDate.format('MMMM YYYY')}</span>
              <Calendar.SetVisibleMonth
                target="next"
                className={styles.SetVisibleMonth}
              >
                ▶
              </Calendar.SetVisibleMonth>
            </header>
            <Calendar.DaysGrid className={styles.DaysGrid}>
              <Calendar.DaysGridHeader className={styles.DaysGridHeader}>
                {({ days }) => (
                  <React.Fragment>
                    <span
                      role="columnheader"
                      aria-label="Week number"
                      className={styles.DaysGridHeaderCell}
                    >
                      #
                    </span>
                    {days.map((day) => (
                      <Calendar.DaysGridHeaderCell
                        value={day}
                        key={day.toString()}
                        className={styles.DaysGridHeaderCell}
                      />
                    ))}
                  </React.Fragment>
                )}
              </Calendar.DaysGridHeader>
              <Calendar.DaysGridBody className={styles.DaysGridBody}>
                {({ weeks }) =>
                  weeks.map((week) => (
                    <Calendar.DaysWeekRow
                      value={week}
                      key={week.toString()}
                      className={styles.DaysWeekRow}
                    >
                      {({ days }) => (
                        <React.Fragment>
                          <span
                            role="rowheader"
                            aria-label={`Week ${days[0].week()}`}
                            className={styles.DaysWeekNumber}
                          >
                            {days[0].week()}
                          </span>
                          {days.map((day) => (
                            <Calendar.DaysCell
                              value={day}
                              key={day.toString()}
                              className={styles.DaysCell}
                            />
                          ))}
                        </React.Fragment>
                      )}
                    </Calendar.DaysWeekRow>
                  ))
                }
              </Calendar.DaysGridBody>
            </Calendar.DaysGrid>
          </React.Fragment>
        )}
      </Calendar.Root>
    </LocalizationProvider>
  );
}

export default function DayCalendarWithWeekNumberDemo() {
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
