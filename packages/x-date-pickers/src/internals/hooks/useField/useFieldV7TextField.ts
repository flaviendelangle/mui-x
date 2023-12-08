import * as React from 'react';
import useForkRef from '@mui/utils/useForkRef';
import useEventCallback from '@mui/utils/useEventCallback';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import {
  getSectionDOMElementFromSectionIndex,
  getSectionIndexFromDOMElement,
  parseSelectedSections,
} from './useField.utils';
import { UseFieldTextField, UseFieldTextFieldInteractions } from './useField.types';
import { getActiveElement } from '../../utils/utils';
import { PickersSectionElement } from '../../../PickersSectionsList';

export const useFieldV7TextField: UseFieldTextField<false> = (params) => {
  const {
    internalProps: { disabled, readOnly = false },
    forwardedProps: {
      sectionsContainerRef: inSectionsContainerRef,
      onBlur,
      onClick,
      onFocus,
      onInput,
      onPaste,
      focused: focusedProp,
      autoFocus = false,
    },
    fieldValueManager,
    applyCharacterEditing,
    resetCharacterQuery,
    setSelectedSections,
    parsedSelectedSections,
    state,
    clearActiveSection,
    clearValue,
    updateSectionValue,
    updateValueFromValueStr,
    sectionOrder,
    areAllSectionsEmpty,
  } = params;

  const sectionsContainerRef = React.useRef<HTMLDivElement>(null);
  const handleSectionsContainerRef = useForkRef(inSectionsContainerRef, sectionsContainerRef);

  const [focused, setFocused] = React.useState(false);

  const interactions = React.useMemo<UseFieldTextFieldInteractions>(
    () => ({
      syncSelectionToDOM: () => {
        if (!sectionsContainerRef.current) {
          return;
        }

        const selection = document.getSelection();
        if (!selection) {
          return;
        }

        if (parsedSelectedSections == null) {
          // If the selection contains an element inside the field, we reset it.
          if (
            selection.rangeCount > 0 &&
            sectionsContainerRef.current.contains(selection.getRangeAt(0).startContainer)
          ) {
            selection.removeAllRanges();
          }

          if (focused) {
            sectionsContainerRef.current.blur();
          }
          return;
        }

        // On multi input range pickers we want to update selection range only for the active input
        if (!sectionsContainerRef.current.contains(getActiveElement(document))) {
          return;
        }

        const range = new window.Range();

        const target =
          parsedSelectedSections === 'all'
            ? sectionsContainerRef.current
            : getSectionDOMElementFromSectionIndex(sectionsContainerRef, parsedSelectedSections);

        range.selectNodeContents(target);
        target.focus();
        selection.removeAllRanges();
        selection.addRange(range);
      },
      getActiveSectionIndexFromDOM: () => {
        const activeElement = getActiveElement(document) as HTMLElement | undefined;
        if (
          !activeElement ||
          !sectionsContainerRef.current ||
          !sectionsContainerRef.current.contains(activeElement)
        ) {
          return null;
        }

        return getSectionIndexFromDOMElement(activeElement);
      },
      focusField: (newSelectedSections = 0) => {
        const newParsedSelectedSections = parseSelectedSections(
          newSelectedSections,
          state.sections,
        ) as number;

        setFocused(true);
        getSectionDOMElementFromSectionIndex(
          sectionsContainerRef,
          newParsedSelectedSections,
        ).focus();
      },
      setSelectedSections: (newSelectedSections) => {
        if (!sectionsContainerRef.current) {
          return;
        }

        const newParsedSelectedSections = parseSelectedSections(
          newSelectedSections,
          state.sections,
        );
        const newActiveSectionIndex =
          newParsedSelectedSections === 'all' ? 0 : newParsedSelectedSections;
        setFocused(newActiveSectionIndex !== null);
        setSelectedSections(newSelectedSections);
      },
      isFieldFocused: () => {
        const activeElement = getActiveElement(document);
        return (
          !!sectionsContainerRef.current && sectionsContainerRef.current.contains(activeElement)
        );
      },
    }),
    [parsedSelectedSections, setSelectedSections, state.sections, focused],
  );

  /**
   * If a section content has been updated with a value we don't want to keep,
   * Then we need to imperatively revert it (we can't let React do it because the value did not change in his internal representation).
   */
  const revertDOMSectionChange = useEventCallback((sectionIndex: number) => {
    if (!sectionsContainerRef.current) {
      return;
    }

    const section = state.sections[sectionIndex];

    getSectionDOMElementFromSectionIndex(sectionsContainerRef, sectionIndex)!.innerHTML =
      section.value || section.placeholder;
    interactions.syncSelectionToDOM();
  });

  const handleContainerClick = useEventCallback((event: React.MouseEvent, ...args) => {
    // The click event on the clear button would propagate to the input, trigger this handler and result in a wrong section selection.
    // We avoid this by checking if the call of `handleContainerClick` is actually intended, or a side effect.
    if (event.isDefaultPrevented() || !sectionsContainerRef.current) {
      return;
    }

    setFocused(true);
    onClick?.(event, ...(args as []));

    if (parsedSelectedSections === 'all') {
      window.setTimeout(() => {
        const cursorPosition = document.getSelection()!.getRangeAt(0).startOffset;

        if (cursorPosition === 0) {
          setSelectedSections(sectionOrder.startIndex);
          return;
        }

        let sectionIndex = 0;
        let cursorOnStartOfSection = 0;

        while (cursorOnStartOfSection < cursorPosition && sectionIndex < state.sections.length) {
          const section = state.sections[sectionIndex];
          sectionIndex += 1;
          cursorOnStartOfSection += `${section.startSeparator}${
            section.value || section.placeholder
          }${section.endSeparator}`.length;
        }

        setSelectedSections(sectionIndex - 1);
      });
    } else if (!focused) {
      setFocused(true);
      setSelectedSections(sectionOrder.startIndex);
    } else {
      const hasClickedOnASection = sectionsContainerRef.current.contains(event.target as Node);

      if (!hasClickedOnASection) {
        setSelectedSections(sectionOrder.startIndex);
      }
    }
  });

  const handleContainerInput = useEventCallback((event: React.FormEvent<HTMLDivElement>) => {
    onInput?.(event);

    if (!sectionsContainerRef.current || parsedSelectedSections !== 'all') {
      return;
    }

    const target = event.target as HTMLSpanElement;
    const keyPressed = target.textContent ?? '';

    sectionsContainerRef.current.innerHTML = state.sections
      .map(
        (section) =>
          `${section.startSeparator}${section.value || section.placeholder}${section.endSeparator}`,
      )
      .join('');
    interactions.syncSelectionToDOM();

    if (keyPressed.length === 0 || keyPressed.charCodeAt(0) === 10) {
      resetCharacterQuery();
      clearValue();
      setSelectedSections('all');
    } else {
      applyCharacterEditing({
        keyPressed,
        sectionIndex: 0,
      });
    }
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

  const handleContainerFocus = useEventCallback((...args) => {
    onFocus?.(...(args as []));

    if (focused) {
      return;
    }

    setFocused(true);

    const isFocusInsideASection = getSectionIndexFromDOMElement(getActiveElement(document)) != null;
    if (!isFocusInsideASection) {
      setSelectedSections(sectionOrder.startIndex);
    }
  });

  const handleContainerBlur = useEventCallback((...args) => {
    onBlur?.(...(args as []));
    window.setTimeout(() => {
      if (!sectionsContainerRef.current) {
        return;
      }

      const activeElement = getActiveElement(document);
      const shouldBlur = !sectionsContainerRef.current.contains(activeElement);
      if (shouldBlur) {
        setFocused(false);
        setSelectedSections(null);
      }
    });
  });

  const getInputContainerClickHandler = useEventCallback(
    (sectionIndex: number) => (event: React.MouseEvent<HTMLDivElement>) => {
      // The click event on the clear button would propagate to the input, trigger this handler and result in a wrong section selection.
      // We avoid this by checking if the call to this function is actually intended, or a side effect.
      if (event.isDefaultPrevented() || readOnly) {
        return;
      }

      setSelectedSections(sectionIndex);
    },
  );

  const handleInputContentMouseUp = useEventCallback((event: React.MouseEvent) => {
    // Without this, the browser will remove the selected when clicking inside an already-selected section.
    event.preventDefault();
  });

  const getInputContentFocusHandler = useEventCallback((sectionIndex: number) => () => {
    if (readOnly) {
      return;
    }

    setSelectedSections(sectionIndex);
  });

  const handleInputContentPaste = useEventCallback(
    (event: React.ClipboardEvent<HTMLSpanElement>) => {
      if (readOnly || typeof parsedSelectedSections !== 'number') {
        event.preventDefault();
        return;
      }

      const activeSection = state.sections[parsedSelectedSections];
      const pastedValue = event.clipboardData.getData('text');
      const lettersOnly = /^[a-zA-Z]+$/.test(pastedValue);
      const digitsOnly = /^[0-9]+$/.test(pastedValue);
      const digitsAndLetterOnly = /^(([a-zA-Z]+)|)([0-9]+)(([a-zA-Z]+)|)$/.test(pastedValue);
      const isValidPastedValue =
        (activeSection.contentType === 'letter' && lettersOnly) ||
        (activeSection.contentType === 'digit' && digitsOnly) ||
        (activeSection.contentType === 'digit-with-letter' && digitsAndLetterOnly);
      if (isValidPastedValue) {
        updateSectionValue({
          activeSection,
          newSectionValue: pastedValue,
          shouldGoToNextSection: true,
        });
      }
      if (lettersOnly || digitsOnly) {
        // The pasted value correspond to a single section but not the expected type
        // skip the modification
        event.preventDefault();
      }
    },
  );

  const handleInputContentDragOver = useEventCallback((event: React.DragEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'none';
  });

  const handleInputContentInput = useEventCallback((event: React.FormEvent<HTMLSpanElement>) => {
    const target = event.target as HTMLSpanElement;
    const keyPressed = target.textContent ?? '';
    const sectionIndex = getSectionIndexFromDOMElement(target)!;
    const section = state.sections[sectionIndex];

    if (readOnly || !sectionsContainerRef.current) {
      revertDOMSectionChange(sectionIndex);
      return;
    }

    if (keyPressed.length === 0) {
      if (section.value === '') {
        revertDOMSectionChange(sectionIndex);
        return;
      }

      resetCharacterQuery();
      clearActiveSection();
      return;
    }

    applyCharacterEditing({
      keyPressed,
      sectionIndex,
    });

    // The DOM value needs to remain the one React is expecting.
    revertDOMSectionChange(sectionIndex);
  });

  useEnhancedEffect(() => {
    if (!focused || !sectionsContainerRef.current) {
      return;
    }

    if (parsedSelectedSections === 'all') {
      sectionsContainerRef.current.focus();
    } else if (typeof parsedSelectedSections === 'number') {
      const domElement = getSectionDOMElementFromSectionIndex(
        sectionsContainerRef,
        parsedSelectedSections,
      );
      if (domElement) {
        domElement.focus();
      }
    }
  }, [parsedSelectedSections, focused]);

  const isContainerEditable = parsedSelectedSections === 'all';
  const elements = React.useMemo<PickersSectionElement[]>(() => {
    return state.sections.map((section, index) => {
      return {
        container: {
          'data-sectionindex': index,
          onClick: getInputContainerClickHandler(index),
        } as React.HTMLAttributes<HTMLSpanElement>,
        content: {
          tabIndex: isContainerEditable ? undefined : 0,
          contentEditable: !isContainerEditable && !disabled && !readOnly,
          role: 'spinbutton',
          'aria-label': section.placeholder,
          children: section.value || section.placeholder,
          onInput: handleInputContentInput,
          onPaste: handleInputContentPaste,
          onFocus: getInputContentFocusHandler(index),
          onDragOver: handleInputContentDragOver,
          onMouseUp: handleInputContentMouseUp,
          inputMode: section.contentType === 'letter' ? 'text' : 'numeric',
        },
        before: {
          children: section.startSeparator,
        },
        after: {
          children: section.endSeparator,
        },
      };
    });
  }, [
    state.sections,
    getInputContentFocusHandler,
    handleInputContentPaste,
    handleInputContentDragOver,
    handleInputContentInput,
    getInputContainerClickHandler,
    handleInputContentMouseUp,
    disabled,
    readOnly,
    isContainerEditable,
  ]);

  const handleValueStrChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) =>
    updateValueFromValueStr(event.target.value),
  );

  const valueStr = React.useMemo(
    () =>
      areAllSectionsEmpty
        ? ''
        : fieldValueManager.getV7HiddenInputValueFromSections(state.sections),
    [areAllSectionsEmpty, state.sections, fieldValueManager],
  );

  React.useEffect(() => {
    if (autoFocus && sectionsContainerRef.current) {
      getSectionDOMElementFromSectionIndex(sectionsContainerRef, sectionOrder.startIndex).focus();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    interactions,
    returnedValue: {
      // Forwarded
      autoFocus,
      readOnly,
      focused: focusedProp ?? focused,
      sectionsContainerRef: handleSectionsContainerRef,
      onBlur: handleContainerBlur,
      onClick: handleContainerClick,
      onFocus: handleContainerFocus,
      onInput: handleContainerInput,
      onPaste: handleContainerPaste,

      // Additional
      textField: 'v7' as const,
      elements,
      // TODO v7: Try to set to undefined when there is a section selected.
      tabIndex: 0,
      contentEditable: isContainerEditable,
      value: valueStr,
      onChange: handleValueStrChange,
      areAllSectionsEmpty,
    },
  };
};