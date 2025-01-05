import * as React from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// eslint-disable-next-line no-restricted-imports
import {
  Calendar,
  useCalendarContext,
} from '@mui/x-date-pickers/internals/base/Calendar';
import styles from './calendar.module.css';

function Header(props) {
  const { activeSection, onActiveSectionChange } = props;
  const { visibleDate, setVisibleDate } = useCalendarContext();

  return (
    <header className={styles.Header}>
      {activeSection === 'day' && (
        <div className={styles.HeaderBlock}>
          <button
            type="button"
            onClick={() => setVisibleDate(visibleDate.subtract(1, 'month'))}
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => onActiveSectionChange('month')}
            className={styles.HeaderMonthLabel}
          >
            {visibleDate.format('MMMM')}
          </button>
          <button
            type="button"
            onClick={() => setVisibleDate(visibleDate.add(1, 'month'))}
          >
            ▶
          </button>
        </div>
      )}
      {(activeSection === 'month' || activeSection === 'day') && (
        <div className={styles.HeaderBlock}>
          <button
            type="button"
            onClick={() => setVisibleDate(visibleDate.subtract(1, 'year'))}
          >
            ◀
          </button>
          <button type="button" onClick={() => onActiveSectionChange('year')}>
            {visibleDate.format('YYYY')}
          </button>
          <button
            type="button"
            onClick={() => setVisibleDate(visibleDate.add(1, 'year'))}
          >
            ▶
          </button>
        </div>
      )}
    </header>
  );
}

export default function YearMonthDayCalendar() {
  const [value, setValue] = React.useState(null);
  const [activeSection, setActiveSection] = React.useState('day');

  const handleValueChange = React.useCallback((newValue, context) => {
    if (context.section === 'month') {
      setActiveSection('day');
    }

    if (context.section === 'year') {
      setActiveSection('month');
    }

    setValue(newValue);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Calendar.Root value={value} onValueChange={handleValueChange} disableFuture>
        <div className={styles.Root}>
          <Header
            activeSection={activeSection}
            onActiveSectionChange={setActiveSection}
          />
          {activeSection === 'year' && (
            <Calendar.YearsList className={styles.YearsList}>
              {({ years }) =>
                years.map((year) => (
                  <Calendar.YearsCell
                    value={year}
                    className={styles.YearsCell}
                    key={year.toString()}
                  />
                ))
              }
            </Calendar.YearsList>
          )}
          {activeSection === 'month' && (
            <Calendar.MonthsList className={styles.MonthsList}>
              {({ months }) =>
                months.map((month) => (
                  <Calendar.MonthsCell
                    value={month}
                    className={styles.MonthsCell}
                    key={month.toString()}
                  />
                ))
              }
            </Calendar.MonthsList>
          )}
          {activeSection === 'day' && (
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
                          <div
                            key={day.toString()}
                            className={styles.DaysCellWrapper}
                          >
                            <Calendar.DaysCell
                              value={day}
                              className={styles.DaysCell}
                            />
                          </div>
                        ))
                      }
                    </Calendar.DaysWeekRow>
                  ))
                }
              </Calendar.DaysGridBody>
            </Calendar.DaysGrid>
          )}
        </div>
      </Calendar.Root>
    </LocalizationProvider>
  );
}