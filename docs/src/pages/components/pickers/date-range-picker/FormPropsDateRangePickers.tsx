import * as React from 'react';
import TextField from '@mui/material/TextField';
import { DateRangePicker, DateRange } from '@mui/x-pickers/DateRangePicker';
import { AdapterDateFns } from '@mui/x-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-pickers/LocalizationProvider';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

export default function FormPropsDateRangePickers() {
  const [value, setValue] = React.useState<DateRange<Date>>([null, null]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <DateRangePicker
          disabled
          startText="disabled start"
          endText="disabled end"
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(startProps, endProps) => (
            <React.Fragment>
              <TextField {...startProps} />
              <Box sx={{ mx: 2 }}> to </Box>
              <TextField {...endProps} />
            </React.Fragment>
          )}
        />
        <DateRangePicker
          readOnly
          startText="read-only start"
          endText="read-only end"
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(startProps, endProps) => (
            <React.Fragment>
              <TextField {...startProps} />
              <Box sx={{ mx: 2 }}> to </Box>
              <TextField {...endProps} />
            </React.Fragment>
          )}
        />
      </Stack>
    </LocalizationProvider>
  );
}
