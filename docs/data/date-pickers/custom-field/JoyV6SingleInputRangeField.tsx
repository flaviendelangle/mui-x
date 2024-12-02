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
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  DateRangePicker,
  DateRangePickerFieldProps,
  DateRangePickerProps,
} from '@mui/x-date-pickers-pro/DateRangePicker';
import { unstable_useSingleInputDateRangeField as useSingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { usePickerContext } from '@mui/x-date-pickers/hooks';
import { FieldType } from '@mui/x-date-pickers-pro/models';
import { BaseSingleInputPickersFieldHooksReturnValue } from '@mui/x-date-pickers/models';

const joyTheme = extendJoyTheme();

interface JoyFieldProps
  extends Omit<InputProps, keyof BaseSingleInputPickersFieldHooksReturnValue<false>>,
    BaseSingleInputPickersFieldHooksReturnValue<false> {
  formControlSx?: InputProps['sx'];
}

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

      // Can be passed to an icon to clear the value
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
      formControlSx,
      slotProps,
      slots,
      ...other
    } = props;

    const pickerContext = usePickerContext();

    return (
      <FormControl
        sx={[...(Array.isArray(formControlSx) ? formControlSx : [formControlSx])]}
        ref={ref}
      >
        <FormLabel>{label}</FormLabel>
        <Input
          ref={pickerContext.triggerRef}
          disabled={disabled}
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

type JoySingleInputDateRangeFieldComponent = ((
  props: DateRangePickerFieldProps<false> & React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element) & { fieldType?: FieldType };

const JoySingleInputDateRangeField = React.forwardRef(
  (props: DateRangePickerFieldProps<false>, ref: React.Ref<HTMLDivElement>) => {
    const fieldResponse = useSingleInputDateRangeField<false, typeof props>({
      ...props,
      enableAccessibleFieldDOMStructure: false,
    }) as BaseSingleInputPickersFieldHooksReturnValue<false>;

    return <JoyField ref={ref} {...fieldResponse} />;
  },
) as JoySingleInputDateRangeFieldComponent;

JoySingleInputDateRangeField.fieldType = 'single-input';

const JoySingleInputDateRangePicker = React.forwardRef(
  (props: DateRangePickerProps<false>, ref: React.Ref<HTMLDivElement>) => {
    return (
      <DateRangePicker
        {...props}
        ref={ref}
        slots={{ ...props.slots, field: JoySingleInputDateRangeField }}
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

export default function JoyV6SingleInputRangeField() {
  const materialTheme = useMaterialTheme();
  return (
    <MaterialCssVarsProvider>
      <CssVarsProvider theme={{ [THEME_ID]: joyTheme }}>
        <SyncThemeMode mode={materialTheme.palette.mode} />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <JoySingleInputDateRangePicker
            slotProps={{
              field: { clearable: true },
            }}
          />
        </LocalizationProvider>
      </CssVarsProvider>
    </MaterialCssVarsProvider>
  );
}
