import * as React from 'react';
import { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// eslint-disable-next-line no-restricted-imports
import { Calendar } from '@mui/x-date-pickers/internals/base/Calendar';
import styles from './calendar.module.css';

export default function YearCalendarWithListLayoutDemo() {
  const [value, setValue] = React.useState<Dayjs | null>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Calendar.Root value={value} onValueChange={setValue} className={styles.Root}>
        <Calendar.YearList className={styles.YearList}>
          {({ years }) =>
            years.map((year) => (
              <Calendar.YearCell
                value={year}
                className={styles.YearCell}
                key={year.toString()}
              />
            ))
          }
        </Calendar.YearList>
      </Calendar.Root>
    </LocalizationProvider>
  );
}
