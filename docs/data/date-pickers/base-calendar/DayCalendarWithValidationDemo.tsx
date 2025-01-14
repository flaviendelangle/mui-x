import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// eslint-disable-next-line no-restricted-imports
import { Calendar } from '@mui/x-date-pickers/internals/base/Calendar';
import styles from './calendar.module.css';

export default function DayCalendarWithValidationDemo() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Calendar.Root disablePast className={styles.Root}>
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
          </React.Fragment>
        )}
      </Calendar.Root>
    </LocalizationProvider>
  );
}
