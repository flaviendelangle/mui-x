import * as React from 'react';
import {
  useTheme as useMaterialTheme,
  useColorScheme as useMaterialColorScheme,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
} from '@mui/material/styles';
import {
  extendTheme as extendJoyTheme,
  useColorScheme,
  CssVarsProvider,
  THEME_ID,
} from '@mui/joy/styles';
import Input, { InputProps } from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import { createSvgIcon } from '@mui/joy/utils';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  DatePicker,
  DatePickerFieldProps,
  DatePickerProps,
} from '@mui/x-date-pickers/DatePicker';
import { unstable_useDateField as useDateField } from '@mui/x-date-pickers/DateField';
import { usePickerContext } from '@mui/x-date-pickers/hooks';
import { BaseSingleInputPickersFieldHooksReturnValue } from '@mui/x-date-pickers/models';

export const CalendarIcon = createSvgIcon(
  <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />,
  'Calendar',
);

const joyTheme = extendJoyTheme();

interface JoyFieldProps
  extends BaseSingleInputPickersFieldHooksReturnValue<false>,
    Omit<InputProps, keyof BaseSingleInputPickersFieldHooksReturnValue<false>> {}

type JoyFieldComponent = ((
  props: JoyFieldProps & React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element) & { propTypes?: any };

const JoyField = React.forwardRef(
  (props: JoyFieldProps, ref: React.Ref<HTMLDivElement>) => {
    const {
      // Should be ignored
      enableAccessibleFieldDOMStructure,

      // Should be passed to the button that opens the picker
      openPickerAriaLabel,

      // Can be passed to the button that clears the value
      clearable,
      onClear,

      // Can be used to render a custom label
      label,

      // Can be used to style the component
      disabled,
      readOnly,
      focused,
      error,
      inputRef,

      // The rest can be passed to the root element
      endDecorator,
      slotProps,
      slots,
      ...other
    } = props;

    const pickerContext = usePickerContext();

    return (
      <FormControl ref={ref}>
        <FormLabel>{label}</FormLabel>
        <Input
          ref={pickerContext.triggerRef}
          disabled={disabled}
          endDecorator={
            <React.Fragment>
              <IconButton
                onClick={() => pickerContext.setOpen((prev) => !prev)}
                aria-label={openPickerAriaLabel}
              >
                <CalendarIcon size="md" />
              </IconButton>
              {endDecorator}
            </React.Fragment>
          }
          slotProps={{
            ...slotProps,
            input: { ref: inputRef },
          }}
          {...other}
        />
      </FormControl>
    );
  },
) as JoyFieldComponent;

const JoyDateField = React.forwardRef(
  (props: DatePickerFieldProps<false>, ref: React.Ref<HTMLDivElement>) => {
    const fieldResponse = useDateField<false, typeof props>({
      ...props,
      enableAccessibleFieldDOMStructure: false,
    });

    return <JoyField ref={ref} {...fieldResponse} />;
  },
);

const JoyDatePicker = React.forwardRef(
  (props: DatePickerProps<false>, ref: React.Ref<HTMLDivElement>) => {
    return (
      <DatePicker
        ref={ref}
        {...props}
        slots={{ ...props.slots, field: JoyDateField }}
      />
    );
  },
);

/**
 * This component is for syncing the theme mode of this demo with the MUI docs mode.
 * You might not need this component in your project.
 */
function SyncThemeMode({ mode }: { mode: 'light' | 'dark' }) {
  const { setMode } = useColorScheme();
  const { setMode: setMaterialMode } = useMaterialColorScheme();
  React.useEffect(() => {
    setMode(mode);
    setMaterialMode(mode);
  }, [mode, setMode, setMaterialMode]);
  return null;
}

export default function JoyV6Field() {
  const materialTheme = useMaterialTheme();
  return (
    <MaterialCssVarsProvider>
      <CssVarsProvider theme={{ [THEME_ID]: joyTheme }}>
        <SyncThemeMode mode={materialTheme.palette.mode} />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <JoyDatePicker />
        </LocalizationProvider>
      </CssVarsProvider>
    </MaterialCssVarsProvider>
  );
}
