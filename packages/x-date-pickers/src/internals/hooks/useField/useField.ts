import * as React from 'react';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useEventCallback from '@mui/utils/useEventCallback';
import useForkRef from '@mui/utils/useForkRef';
import { useTheme } from '@mui/material/styles';
import { useValidation } from '../useValidation';
import { useUtils } from '../useUtils';
import {
  UseFieldParams,
  UseFieldResponse,
  UseFieldForwardedProps,
  UseFieldInternalProps,
  AvailableAdjustKeyCode,
} from './useField.types';
import {
  adjustSectionValue,
  getSectionOrder,
  isFocusInsideContainer,
  getSectionIndexFromDOMElement,
} from './useField.utils';
import { useFieldState } from './useFieldState';
import { useFieldCharacterEditing } from './useFieldCharacterEditing';
import { getActiveElement } from '../../utils/utils';
import { FieldSection } from '../../../models';
import { useFieldElements } from './useFieldElements';

export const useField = <
  TValue,
  TDate,
  TSection extends FieldSection,
  TForwardedProps extends UseFieldForwardedProps,
  TInternalProps extends UseFieldInternalProps<any, any, any, any> & { minutesStep?: number },
>(
  params: UseFieldParams<TValue, TDate, TSection, TForwardedProps, TInternalProps>,
): UseFieldResponse<TForwardedProps> => {
  const utils = useUtils<TDate>();

  const {
    state,
    activeSectionIndex,
    parsedSelectedSections,
    setSelectedSections,
    clearValue,
    clearActiveSection,
    updateSectionValue,
    updateValueFromValueStr,
    setSectionTempValueStr,
    resetSectionsTempValueStr,
    sectionsValueBoundaries,
    timezone,
  } = useFieldState(params);

  const {
    internalProps,
    internalProps: { readOnly = false, unstableFieldRef, minutesStep },
    forwardedProps: {
      onBlur,
      onPaste,
      error,
      clearable,
      onClear,
      disabled = false,
      ref: inContainerRef,
      ...otherForwardedProps
    },
    fieldValueManager,
    valueManager,
    validator,
  } = params;

  const { applyCharacterEditing, resetCharacterQuery } = useFieldCharacterEditing<TDate, TSection>({
    sections: state.sections,
    updateSectionValue,
    sectionsValueBoundaries,
    resetSectionsTempValueStr,
    timezone,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(inContainerRef, containerRef);
  const theme = useTheme();
  const isRTL = theme.direction === 'rtl';

  const elements = useFieldElements({
    ...params,
    applyCharacterEditing,
    resetCharacterQuery,
    setSelectedSections,
    parsedSelectedSections,
    state,
    clearActiveSection,
    setSectionTempValueStr,
    updateSectionValue,
    containerRef,
  });

  const sectionOrder = React.useMemo(
    () => getSectionOrder(state.sections, isRTL),
    [state.sections, isRTL],
  );

  const handleContainerBlur = useEventCallback((...args) => {
    onBlur?.(...(args as []));
    setSelectedSections(null);
  });

  const handleContainerPaste = useEventCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    onPaste?.(event);
    if (readOnly || parsedSelectedSections !== 'all') {
      event.preventDefault();
      return;
    }

    const pastedValue = event.clipboardData.getData('text');
    event.preventDefault();
    resetCharacterQuery();
    updateValueFromValueStr(pastedValue);
  });

  const handleContainerKeyDown = useEventCallback((event: React.KeyboardEvent<HTMLSpanElement>) => {
    // eslint-disable-next-line default-case
    switch (true) {
      // Select all
      case event.key === 'a' && (event.ctrlKey || event.metaKey): {
        // prevent default to make sure that the next line "select all" while updating
        // the internal state at the same time.
        event.preventDefault();
        setSelectedSections('all');
        break;
      }

      // Move selection to next section
      case event.key === 'ArrowRight': {
        event.preventDefault();

        if (parsedSelectedSections == null) {
          setSelectedSections(sectionOrder.startIndex);
        } else if (parsedSelectedSections === 'all') {
          setSelectedSections(state.sections.length - 1);
        } else {
          const nextSectionIndex = sectionOrder.neighbors[parsedSelectedSections].rightIndex;
          if (nextSectionIndex !== null) {
            setSelectedSections(nextSectionIndex);
          }
        }
        break;
      }

      // Move selection to previous section
      case event.key === 'ArrowLeft': {
        event.preventDefault();

        if (parsedSelectedSections == null) {
          setSelectedSections(sectionOrder.endIndex);
        } else if (parsedSelectedSections === 'all') {
          setSelectedSections(0);
        } else {
          const nextSectionIndex = sectionOrder.neighbors[parsedSelectedSections].leftIndex;
          if (nextSectionIndex !== null) {
            setSelectedSections(nextSectionIndex);
          }
        }
        break;
      }

      // Reset the value of the selected section
      case event.key === 'Delete': {
        event.preventDefault();

        if (readOnly) {
          break;
        }

        if (parsedSelectedSections == null || parsedSelectedSections === 'all') {
          clearValue();
        } else {
          clearActiveSection();
        }
        resetCharacterQuery();
        break;
      }

      // Increment / decrement the selected section value
      case ['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key): {
        event.preventDefault();

        if (readOnly || activeSectionIndex == null) {
          break;
        }

        const activeSection = state.sections[activeSectionIndex];
        const activeDateManager = fieldValueManager.getActiveDateManager(
          utils,
          state,
          activeSection,
        );

        const newSectionValue = adjustSectionValue(
          utils,
          timezone,
          activeSection,
          event.key as AvailableAdjustKeyCode,
          sectionsValueBoundaries,
          activeDateManager.date,
          { minutesStep },
        );

        updateSectionValue({
          activeSection,
          newSectionValue,
          shouldGoToNextSection: false,
        });
        break;
      }
    }
  });

  useEnhancedEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Focus no section
    if (parsedSelectedSections == null) {
      if (isFocusInsideContainer(containerRef)) {
        containerRef.current.blur();
      }
      return;
    }

    // Focus several sections
    const selection = document.getSelection();
    if (!selection) {
      return;
    }

    const range = new Range();
    if (parsedSelectedSections === 'all') {
      range.selectNodeContents(containerRef.current);
    } else {
      range.selectNodeContents(
        containerRef.current.querySelector(
          `span[data-sectionindex="${parsedSelectedSections}"] .content`,
        )!,
      );
    }

    selection.removeAllRanges();
    selection.addRange(range);
  });

  const validationError = useValidation(
    { ...internalProps, value: state.value, timezone },
    validator,
    valueManager.isSameError,
    valueManager.defaultErrorState,
  );

  const inputError = React.useMemo(() => {
    // only override when `error` is undefined.
    // in case of multi input fields, the `error` value is provided externally and will always be defined.
    if (error !== undefined) {
      return error;
    }

    return valueManager.hasError(validationError);
  }, [valueManager, validationError, error]);

  React.useEffect(() => {
    if (!inputError && activeSectionIndex == null) {
      resetCharacterQuery();
    }
  }, [state.referenceValue, activeSectionIndex, inputError]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    // Select the right section when focused on mount (`autoFocus = true` on the input)
    if (containerRef.current && containerRef.current.contains(getActiveElement(document))) {
      setSelectedSections('all');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If `tempValueStr` is still defined for some section when running `useEffect`,
  // Then `onChange` has only been called once, which means the user pressed `Backspace` to reset the section.
  // This causes a small flickering on Android,
  // But we can't use `useEnhancedEffect` which is always called before the second `onChange` call and then would cause false positives.
  React.useEffect(() => {
    const sectionWithTempValueStr = state.sections.findIndex(
      (section) => section.tempValueStr != null,
    );
    if (sectionWithTempValueStr > -1 && activeSectionIndex != null) {
      resetCharacterQuery();
      clearActiveSection();
    }
  }, [state.sections]); // eslint-disable-line react-hooks/exhaustive-deps

  const areAllSectionsEmpty = valueManager.areValuesEqual(
    utils,
    state.value,
    valueManager.emptyValue,
  );

  React.useImperativeHandle(unstableFieldRef, () => ({
    getSections: () => state.sections,
    getActiveSectionIndex: () => {
      const activeElement = getActiveElement(document) as HTMLElement | undefined;
      if (
        !activeElement ||
        !containerRef.current ||
        !containerRef.current.contains(activeElement)
      ) {
        return null;
      }

      return getSectionIndexFromDOMElement(
        getActiveElement(document) as HTMLSpanElement | undefined,
      );
    },
    setSelectedSections: (newActiveSectionIndex) => setSelectedSections(newActiveSectionIndex),
  }));

  const handleClearValue = useEventCallback((event: React.MouseEvent, ...args) => {
    event.preventDefault();
    onClear?.(event, ...(args as []));
    clearValue();
    setSelectedSections(0);
  });

  const handleValueStrChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) =>
    updateValueFromValueStr(event.target.value),
  );

  const valueStr = React.useMemo(
    () => fieldValueManager.getHiddenInputValueFromSections(state.sections),
    [state.sections, fieldValueManager],
  );

  return {
    disabled,
    ...otherForwardedProps,
    elements,
    readOnly,
    valueType:
      !isFocusInsideContainer(containerRef) && areAllSectionsEmpty ? 'placeholder' : 'value',
    valueStr,
    onValueStrChange: handleValueStrChange,
    onKeyDown: handleContainerKeyDown,
    onBlur: handleContainerBlur,
    onPaste: handleContainerPaste,
    onClear: handleClearValue,
    error: inputError,
    ref: handleRef,
    clearable: Boolean(clearable && !areAllSectionsEmpty && !readOnly && !disabled),
  };
};
