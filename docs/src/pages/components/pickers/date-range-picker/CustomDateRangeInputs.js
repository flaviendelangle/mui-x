import * as React from 'react';
import Box from '@mui/material/Box';
import { AdapterDateFns } from '@mui/x-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-pickers/LocalizationProvider';
import { DateRangePicker } from '@mui/x-pickers/DateRangePicker';

export default function CustomDateRangeInputs() {
  const [value, setValue] = React.useState([null, null]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateRangePicker
        label="Advanced keyboard"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        renderInput={(startProps, endProps) => (
          <React.Fragment>
            <input ref={startProps.inputRef} {...startProps.inputProps} />
            <Box sx={{ mx: 1 }}> to </Box>
            <input ref={endProps.inputRef} {...endProps.inputProps} />
          </React.Fragment>
        )}
      />
    </LocalizationProvider>
  );
}
