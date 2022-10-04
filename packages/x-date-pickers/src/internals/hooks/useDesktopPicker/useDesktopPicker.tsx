import * as React from 'react';
import { useSlotProps } from '@mui/base/utils';
import MuiInputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import useForkRef from '@mui/utils/useForkRef';
import { PickersPopper } from '../../components/PickersPopper';
import { CalendarOrClockPickerView } from '../../models/views';
import { UseDesktopPickerParams } from './useDesktopPicker.types';
import { useUtils } from '../useUtils';
import { usePicker } from '../usePicker';
import { LocalizationProvider } from '../../../LocalizationProvider';
import { WrapperVariantContext } from '../../components/wrappers/WrapperVariantContext';

/**
 * Hook managing all the single-date desktop pickers:
 * - DesktopDatePicker
 * - DesktopDateTimePicker
 * - DesktopTimePicker
 */
export const useDesktopPicker = <TDate, TView extends CalendarOrClockPickerView>({
  props,
  valueManager,
  renderViews: renderViewsParam,
  getOpenDialogAriaText,
  sectionModeLookup,
}: UseDesktopPickerParams<TDate, TView>) => {
  const {
    components,
    componentsProps = {},
    className,
    inputFormat,
    readOnly,
    disabled,
    disableOpenPicker,
    localeText,
  } = props;

  const utils = useUtils<TDate>();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const {
    field: headlessPickerFieldResponse,
    renderViews,
    actions,
    open,
    hasPopperView,
    shouldRestoreFocus,
  } = usePicker({
    props,
    valueManager,
    wrapperVariant: 'desktop',
    renderViews: renderViewsParam,
    sectionModeLookup,
    inputRef,
    additionalViewProps: {},
  });

  const Field = components.Field;
  const fieldProps = useSlotProps({
    elementType: Field,
    externalSlotProps: componentsProps.field,
    additionalProps: {
      ...headlessPickerFieldResponse,
      readOnly,
      disabled,
      className,
      format: inputFormat,
    },
    // TODO: Pass owner state
    ownerState: {},
  });

  const InputAdornment = components.InputAdornment ?? MuiInputAdornment;
  const inputAdornmentProps = useSlotProps({
    elementType: InputAdornment,
    externalSlotProps: componentsProps.inputAdornment,
    additionalProps: {
      position: 'end',
    },
    // TODO: Pass owner state
    ownerState: {},
  });

  const OpenPickerButton = components.OpenPickerButton ?? IconButton;
  const { ownerState: openPickerButtonOwnerState, ...openPickerButtonProps } = useSlotProps({
    elementType: OpenPickerButton,
    externalSlotProps: componentsProps.openPickerButton,
    additionalProps: {
      disabled: disabled || readOnly || !hasPopperView,
      onClick: actions.onOpen,
      // TODO: Correctly support date range
      'aria-label': getOpenDialogAriaText(fieldProps.value as any as TDate, utils),
      edge: inputAdornmentProps.position,
    },
    // TODO: Pass owner state
    ownerState: {},
  });

  const OpenPickerIcon = components.OpenPickerIcon;
  const { ownerState: openPickerIconOwnerState, ...openPickerIconProps } = useSlotProps({
    elementType: OpenPickerIcon,
    externalSlotProps: componentsProps.openPickerIcon,
    // TODO: Pass owner state
    ownerState: {},
  });

  const Input = components.Input!;
  const inputProps = useSlotProps({
    elementType: Input,
    externalSlotProps: componentsProps.input,
    additionalProps: {
      InputProps: {
        [`${inputAdornmentProps.position}Adornment`]: disableOpenPicker ? undefined : (
          <InputAdornment {...inputAdornmentProps}>
            <OpenPickerButton {...openPickerButtonProps}>
              <OpenPickerIcon {...openPickerIconProps} />
            </OpenPickerButton>
          </InputAdornment>
        ),
      },
    },
    // TODO: Pass owner state
    ownerState: {},
  });

  // TODO: Correctly type the field slot
  const handleInputRef = useForkRef(inputRef, (fieldProps as any).inputRef);

  const renderPicker = () => (
    <LocalizationProvider localeText={localeText}>
      <WrapperVariantContext.Provider value="desktop">
        <Field
          {...fieldProps}
          components={{
            ...(fieldProps as any).components,
            Input: components.Input,
          }}
          componentsProps={{ ...(fieldProps as any).componentsProps, input: inputProps }}
          inputRef={handleInputRef}
        />
        <PickersPopper
          role="dialog"
          anchorEl={inputRef.current}
          {...actions}
          open={open}
          components={components}
          componentsProps={componentsProps}
          shouldRestoreFocus={shouldRestoreFocus}
        >
          {renderViews()}
        </PickersPopper>
      </WrapperVariantContext.Provider>
    </LocalizationProvider>
  );

  return { renderPicker };
};
