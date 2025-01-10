import * as React from 'react';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useEventCallback from '@mui/utils/useEventCallback';
import { PickerValidDate } from '@mui/x-date-pickers/models';
import { ValidateDateProps } from '@mui/x-date-pickers/validation';
import { PickerRangeValue, RangePosition, useUtils } from '@mui/x-date-pickers/internals';
// eslint-disable-next-line no-restricted-imports
import {
  useAddDefaultsToBaseDateValidationProps,
  useBaseCalendarRoot,
} from '@mui/x-date-pickers/internals/base/utils/base-calendar/root/useBaseCalendarRoot';
// eslint-disable-next-line no-restricted-imports
import { BaseCalendarRootContext } from '@mui/x-date-pickers/internals/base/utils/base-calendar/root/BaseCalendarRootContext';
// eslint-disable-next-line no-restricted-imports
import { mergeReactProps } from '@mui/x-date-pickers/internals/base/base-utils/mergeReactProps';
// eslint-disable-next-line no-restricted-imports
import { GenericHTMLProps } from '@mui/x-date-pickers/internals/base/base-utils/types';
import { DateRangeValidationError } from '../../../../models';
import { useDateRangeManager } from '../../../../managers';
import {
  ValidateDateRangeProps,
  ExportedValidateDateRangeProps,
} from '../../../../validation/validateDateRange';
import { calculateRangeChange, calculateRangePreview } from '../../../utils/date-range-manager';
import { isRangeValid } from '../../../utils/date-utils';
import { useRangePosition, UseRangePositionProps } from '../../../hooks/useRangePosition';
import { RangeCalendarRootContext } from './RangeCalendarRootContext';

const DEFAULT_AVAILABLE_RANGE_POSITIONS: RangePosition[] = ['start', 'end'];

export function useRangeCalendarRoot(parameters: useRangeCalendarRoot.Parameters) {
  const {
    // Validation props
    minDate,
    maxDate,
    disablePast,
    disableFuture,
    shouldDisableDate,
    // Range position props
    rangePosition: rangePositionProp,
    defaultRangePosition: defaultRangePositionProp,
    onRangePositionChange: onRangePositionChangeProp,
    availableRangePositions = DEFAULT_AVAILABLE_RANGE_POSITIONS,
    // Other range-specific parameters
    disableDragEditing = false,
    disableHoverPreview = false,
    // Parameters forwarded to `useBaseCalendarRoot`
    ...baseParameters
  } = parameters;
  const utils = useUtils();
  const manager = useDateRangeManager();

  // TODO: Add support for range position from the context when implementing the Picker Base UI X component.
  const { rangePosition, onRangePositionChange } = useRangePosition({
    rangePosition: rangePositionProp,
    defaultRangePosition: defaultRangePositionProp,
    onRangePositionChange: onRangePositionChangeProp,
  });

  const baseDateValidationProps = useAddDefaultsToBaseDateValidationProps({
    minDate,
    maxDate,
    disablePast,
    disableFuture,
  });

  const shouldDisableDateForSingleDateValidation = React.useMemo(() => {
    if (!shouldDisableDate) {
      return undefined;
    }

    return (dayToTest: PickerValidDate) =>
      // TODO: Add correct range position.
      shouldDisableDate(dayToTest, rangePosition /* draggingDatePosition || rangePosition */);
  }, [shouldDisableDate, rangePosition]);

  const dateValidationProps = React.useMemo<ValidateDateProps>(
    () => ({
      ...baseDateValidationProps,
      shouldDisableDate: shouldDisableDateForSingleDateValidation,
    }),
    [baseDateValidationProps, shouldDisableDateForSingleDateValidation],
  );

  const valueValidationProps = React.useMemo<ValidateDateRangeProps>(
    () => ({
      ...baseDateValidationProps,
      shouldDisableDate,
    }),
    [baseDateValidationProps, shouldDisableDate],
  );

  const getNewValueFromNewSelectedDate = useEventCallback(
    ({
      prevValue,
      selectedDate,
      referenceDate,
      allowRangeFlip,
    }: useBaseCalendarRoot.GetNewValueFromNewSelectedDateParameters<PickerRangeValue> & {
      allowRangeFlip?: boolean;
    }): useBaseCalendarRoot.GetNewValueFromNewSelectedDateReturnValue<PickerRangeValue> => {
      const { nextSelection, newRange } = calculateRangeChange({
        newDate: selectedDate,
        utils,
        range: prevValue,
        rangePosition,
        allowRangeFlip,
        shouldMergeDateAndTime: true,
        referenceDate,
      });

      const isNextSectionAvailable = availableRangePositions.includes(nextSelection);
      if (isNextSectionAvailable) {
        onRangePositionChange(nextSelection);
      }

      const isFullRangeSelected = rangePosition === 'end' && isRangeValid(utils, newRange);

      return {
        value: newRange,
        changeImportance: isFullRangeSelected || !isNextSectionAvailable ? 'set' : 'accept',
      };
    },
  );

  const calendarValueManager = React.useMemo<
    useBaseCalendarRoot.ValueManager<PickerRangeValue>
  >(() => {
    return {
      getDateToUseForReferenceDate: (value) => value[0] ?? value[1],
      getCurrentDateFromValue: (value) => (rangePosition === 'start' ? value[0] : value[1]),
      getNewValueFromNewSelectedDate,
      getSelectedDatesFromValue: (value) => value.filter((date) => date != null),
    };
  }, [rangePosition, getNewValueFromNewSelectedDate]);

  const {
    value,
    referenceDate,
    setValue,
    setVisibleDate,
    isDateCellVisible,
    context: baseContext,
  } = useBaseCalendarRoot({
    ...baseParameters,
    manager,
    valueValidationProps,
    dateValidationProps,
    calendarValueManager,
  });

  // TODO: Apply some logic based on the range position.
  const [prevValue, setPrevValue] = React.useState<PickerRangeValue>(value);
  if (value !== prevValue) {
    setPrevValue(value);
    let targetDate: PickerValidDate | null = null;
    if (utils.isValid(value[0])) {
      targetDate = value[0];
    } else if (utils.isValid(value[1])) {
      targetDate = value[1];
    }
    if (targetDate != null && isDateCellVisible(targetDate)) {
      setVisibleDate(targetDate);
    }
  }

  const { context } = useBuildRangeCalendarRootContext({
    baseContext,
    setValue,
    value,
    referenceDate,
    onRangePositionChange,
    rangePosition,
    disableDragEditing,
    disableHoverPreview,
    getNewValueFromNewSelectedDate,
  });

  const getRootProps = React.useCallback((externalProps: GenericHTMLProps) => {
    return mergeReactProps(externalProps, {});
  }, []);

  return React.useMemo(
    () => ({ getRootProps, context, baseContext }),
    [getRootProps, context, baseContext],
  );
}

export namespace useRangeCalendarRoot {
  export interface Parameters
    extends useBaseCalendarRoot.PublicParameters<PickerRangeValue, DateRangeValidationError>,
      ExportedValidateDateRangeProps,
      UseRangePositionProps {
    /**
     * Range positions available for selection.
     * This list is checked against when checking if a next range position can be selected.
     *
     * Used on Date Time Range pickers with current `rangePosition` to force a `finish` selection after just one range position selection.
     * @default ['start', 'end']
     */
    availableRangePositions?: RangePosition[];
    /**
     * If `true`, editing dates by dragging is disabled.
     * @default false
     */
    disableDragEditing?: boolean;
    // TODO: Apply smart behavior based on the media que
    /**
     * If `true`, the hover preview is disabled.
     * The cells that would be selected if clicking on the hovered cell won't receive a data-preview attribute.
     * @default false
     */
    disableHoverPreview?: boolean;
  }
}

function useBuildRangeCalendarRootContext(parameters: UseRangeCalendarDragEditingParameters) {
  const {
    value,
    setValue,
    referenceDate,
    baseContext,
    rangePosition,
    onRangePositionChange,
    getNewValueFromNewSelectedDate,
    disableDragEditing: disableDragEditingProp,
    disableHoverPreview: disableHoverPreviewProp,
  } = parameters;
  const utils = useUtils();

  // Range going for the start of the start day to the end of the end day.
  // This makes sure that `isWithinRange` works with any time in the start and end day.
  const valueDayRange = React.useMemo<PickerRangeValue>(
    () => [
      !utils.isValid(value[0]) ? value[0] : utils.startOfDay(value[0]),
      !utils.isValid(value[1]) ? value[1] : utils.endOfDay(value[1]),
    ],
    [value, utils],
  );

  const [state, setState] = React.useState<{
    isDragging: boolean;
    targetDate: PickerValidDate | null;
    draggedDate: PickerValidDate | null;
    hoveredDate: PickerValidDate | null;
  }>({ isDragging: false, targetDate: null, draggedDate: null, hoveredDate: null });

  const selectedRange = React.useMemo<PickerRangeValue>(() => {
    if (!valueDayRange[0] || !valueDayRange[1] || !state.targetDate) {
      return valueDayRange;
    }

    const newRange = calculateRangeChange({
      utils,
      range: valueDayRange,
      newDate: state.targetDate,
      rangePosition,
      allowRangeFlip: true,
    }).newRange;
    return newRange[0] !== null && newRange[1] !== null
      ? [utils.startOfDay(newRange[0]), utils.endOfDay(newRange[1])]
      : newRange;
  }, [rangePosition, state.targetDate, utils, valueDayRange]);

  const selectDayFromDrag = useEventCallback((selectedDate: PickerValidDate) => {
    if (state.draggedDate != null && utils.isSameDay(selectedDate, state.draggedDate)) {
      return;
    }

    const response = getNewValueFromNewSelectedDate({
      prevValue: value,
      selectedDate,
      referenceDate,
      allowRangeFlip: true,
    });

    setValue(response.value, { changeImportance: response.changeImportance, section: 'day' });
  });

  const disableDragEditing = disableDragEditingProp || baseContext.disabled || baseContext.readOnly;
  const disableHoverPreview =
    disableHoverPreviewProp || baseContext.disabled || baseContext.readOnly;

  const isDraggingRef = React.useRef(state.isDragging);
  useEnhancedEffect(() => {
    isDraggingRef.current = state.isDragging;
  });

  const emptyDragImgRef = React.useRef<HTMLImageElement | null>(null);
  React.useEffect(() => {
    // Preload the image - required for Safari support: https://stackoverflow.com/a/40923520/3303436
    emptyDragImgRef.current = document.createElement('img');
    emptyDragImgRef.current.src =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }, []);

  const startDragging = useEventCallback((position: RangePosition) => {
    setState((prev) => ({ ...prev, isDragging: true }));
    onRangePositionChange(position);
  });

  const stopDragging = useEventCallback(() => {
    setState((prev) => ({
      ...prev,
      isDragging: false,
      draggedDate: null,
      targetDate: null,
    }));
  });

  const handleSetDragTarget = useEventCallback((newTargetDate: PickerValidDate) => {
    if (utils.isEqual(newTargetDate, state.targetDate)) {
      return;
    }

    setState((prev) => ({ ...prev, targetDate: newTargetDate }));

    if (value[0] && utils.isBeforeDay(newTargetDate, value[0])) {
      onRangePositionChange('start');
    } else if (value[1] && utils.isAfterDay(newTargetDate, value[1])) {
      onRangePositionChange('end');
    }
  });

  const setHoveredDate = useEventCallback((hoveredDate: PickerValidDate | null) => {
    if (disableHoverPreview) {
      return;
    }
    setState((prev) => ({ ...prev, hoveredDate }));
  });

  const previewRange = React.useMemo<PickerRangeValue>(() => {
    if (disableHoverPreview) {
      return [null, null];
    }

    return calculateRangePreview({
      utils,
      range: valueDayRange,
      newDate: state.hoveredDate,
      rangePosition,
    });
  }, [utils, rangePosition, state.hoveredDate, valueDayRange, disableHoverPreview]);

  const context: RangeCalendarRootContext = {
    value,
    selectedRange,
    previewRange,
    disableDragEditing,
    isDraggingRef,
    emptyDragImgRef,
    selectDayFromDrag,
    startDragging,
    stopDragging,
    setDragTarget: handleSetDragTarget,
    isDragging: state.isDragging,
    setHoveredDate,
  };

  return { context };
}

interface UseRangeCalendarDragEditingParameters {
  value: PickerRangeValue;
  referenceDate: PickerValidDate;
  setValue: useBaseCalendarRoot.ReturnValue<PickerRangeValue>['setValue'];
  baseContext: BaseCalendarRootContext;
  disableDragEditing: boolean;
  getNewValueFromNewSelectedDate: (
    parameters: useBaseCalendarRoot.GetNewValueFromNewSelectedDateParameters<PickerRangeValue> & {
      allowRangeFlip?: boolean;
    },
  ) => useBaseCalendarRoot.GetNewValueFromNewSelectedDateReturnValue<PickerRangeValue>;
  onRangePositionChange: (position: RangePosition) => void;
  rangePosition: RangePosition;
  disableHoverPreview: boolean;
}