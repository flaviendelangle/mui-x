import useEventCallback from '@mui/utils/useEventCallback';
import { FieldSection, InferFieldSection } from '../../../models';
import {
  changeSectionValueFormat,
  cleanDigitSectionValue,
  doesSectionFormatHaveLeadingZeros,
  getDateSectionConfigFromFormatToken,
  getDaysInWeekStr,
  getLetterEditingOptions,
  applyLocalizedDigits,
  removeLocalizedDigits,
  isStringNumber,
} from './useField.utils';
import { UseFieldStateReturnValue } from './useFieldState';
import { PickerValidValue } from '../../models';
import { usePickerAdapter } from '../../../hooks/usePickerAdapter';

const isQueryResponseWithoutValue = <TValue extends PickerValidValue>(
  response: ReturnType<QueryApplier<TValue>>,
): response is { saveQuery: boolean } => (response as { saveQuery: boolean }).saveQuery != null;

/**
 * Update the active section value when the user pressed a key that is not a navigation key (arrow key for example).
 * This hook has two main editing behaviors
 *
 * 1. The numeric editing when the user presses a digit
 * 2. The letter editing when the user presses another key
 */
export const useFieldCharacterEditing = <TValue extends PickerValidValue>({
  stateResponse: {
    // States and derived states
    localizedDigits,
    sectionsValueBoundaries,
    state,
    timezone,

    // Methods to update the states
    setCharacterQuery,
    setTempAndroidValueStr,
    updateSectionValue,
  },
}: UseFieldCharacterEditingParameters<TValue>): UseFieldCharacterEditingReturnValue => {
  const adapter = usePickerAdapter();

  const applyQuery = (
    { keyPressed, sectionIndex }: ApplyCharacterEditingParameters,
    getFirstSectionValueMatchingWithQuery: QueryApplier<TValue>,
    isValidQueryValue?: (queryValue: string) => boolean,
  ): ReturnType<CharacterEditingApplier> => {
    const cleanKeyPressed = keyPressed.toLowerCase();
    const activeSection = state.sections[sectionIndex];

    // The current query targets the section being editing
    // We can try to concatenate the value
    if (
      state.characterQuery != null &&
      (!isValidQueryValue || isValidQueryValue(state.characterQuery.value)) &&
      state.characterQuery.sectionIndex === sectionIndex
    ) {
      const concatenatedQueryValue = `${state.characterQuery.value}${cleanKeyPressed}`;

      const queryResponse = getFirstSectionValueMatchingWithQuery(
        concatenatedQueryValue,
        activeSection,
      );
      if (!isQueryResponseWithoutValue(queryResponse)) {
        setCharacterQuery({
          sectionIndex,
          value: concatenatedQueryValue,
          sectionType: activeSection.type,
        });
        return queryResponse;
      }
    }

    const queryResponse = getFirstSectionValueMatchingWithQuery(cleanKeyPressed, activeSection);
    if (isQueryResponseWithoutValue(queryResponse) && !queryResponse.saveQuery) {
      setCharacterQuery(null);
      return null;
    }

    setCharacterQuery({
      sectionIndex,
      value: cleanKeyPressed,
      sectionType: activeSection.type,
    });

    if (isQueryResponseWithoutValue(queryResponse)) {
      return null;
    }

    return queryResponse;
  };

  const applyLetterEditing: CharacterEditingApplier = (params) => {
    const findMatchingOptions = (
      format: string,
      options: string[],
      queryValue: string,
    ): ReturnType<QueryApplier<TValue>> => {
      const matchingValues = options.filter((option) =>
        option.toLowerCase().startsWith(queryValue),
      );

      if (matchingValues.length === 0) {
        return { saveQuery: false };
      }

      return {
        sectionValue: matchingValues[0],
        shouldGoToNextSection: matchingValues.length === 1,
      };
    };

    const testQueryOnFormatAndFallbackFormat = (
      queryValue: string,
      activeSection: InferFieldSection<TValue>,
      fallbackFormat?: string,
      formatFallbackValue?: (fallbackValue: string, fallbackOptions: string[]) => string,
    ) => {
      const getOptions = (format: string) =>
        getLetterEditingOptions(adapter, timezone, activeSection.type, format);

      if (activeSection.contentType === 'letter') {
        return findMatchingOptions(
          activeSection.format,
          getOptions(activeSection.format),
          queryValue,
        );
      }

      // When editing a digit-format month / weekDay and the user presses a letter,
      // We can support the letter editing by using the letter-format month / weekDay and re-formatting the result.
      // We just have to make sure that the default month / weekDay format is a letter format,
      if (
        fallbackFormat &&
        formatFallbackValue != null &&
        getDateSectionConfigFromFormatToken(adapter, fallbackFormat).contentType === 'letter'
      ) {
        const fallbackOptions = getOptions(fallbackFormat);
        const response = findMatchingOptions(fallbackFormat, fallbackOptions, queryValue);
        if (isQueryResponseWithoutValue(response)) {
          return { saveQuery: false };
        }

        return {
          ...response,
          sectionValue: formatFallbackValue(response.sectionValue, fallbackOptions),
        };
      }

      return { saveQuery: false };
    };

    const getFirstSectionValueMatchingWithQuery: QueryApplier<TValue> = (
      queryValue,
      activeSection,
    ) => {
      switch (activeSection.type) {
        case 'month': {
          const formatFallbackValue = (fallbackValue: string) =>
            changeSectionValueFormat(
              adapter,
              fallbackValue,
              adapter.formats.month,
              activeSection.format,
            );

          return testQueryOnFormatAndFallbackFormat(
            queryValue,
            activeSection,
            adapter.formats.month,
            formatFallbackValue,
          );
        }

        case 'weekDay': {
          const formatFallbackValue = (fallbackValue: string, fallbackOptions: string[]) =>
            fallbackOptions.indexOf(fallbackValue).toString();

          return testQueryOnFormatAndFallbackFormat(
            queryValue,
            activeSection,
            adapter.formats.weekday,
            formatFallbackValue,
          );
        }

        case 'meridiem': {
          return testQueryOnFormatAndFallbackFormat(queryValue, activeSection);
        }

        default: {
          return { saveQuery: false };
        }
      }
    };

    return applyQuery(params, getFirstSectionValueMatchingWithQuery);
  };

  const applyNumericEditing: CharacterEditingApplier = (params) => {
    const getNewSectionValue = ({
      queryValue,
      skipIfBelowMinimum,
      section,
    }: {
      queryValue: string;
      skipIfBelowMinimum: boolean;
      section: Pick<
        FieldSection,
        | 'format'
        | 'type'
        | 'contentType'
        | 'hasLeadingZerosInFormat'
        | 'hasLeadingZerosInInput'
        | 'maxLength'
      >;
    }): ReturnType<QueryApplier<TValue>> => {
      const cleanQueryValue = removeLocalizedDigits(queryValue, localizedDigits);
      const queryValueNumber = Number(cleanQueryValue);
      const sectionBoundaries = sectionsValueBoundaries[section.type]({
        currentDate: null,
        format: section.format,
        contentType: section.contentType,
      });

      if (queryValueNumber > sectionBoundaries.maximum) {
        return { saveQuery: false };
      }

      // If the user types `0` on a month section,
      // It is below the minimum, but we want to store the `0` in the query,
      // So that when he pressed `1`, it will store `01` and move to the next section.
      if (skipIfBelowMinimum && queryValueNumber < sectionBoundaries.minimum) {
        return { saveQuery: true };
      }

      const shouldGoToNextSection =
        queryValueNumber * 10 > sectionBoundaries.maximum ||
        cleanQueryValue.length === sectionBoundaries.maximum.toString().length;

      const newSectionValue = cleanDigitSectionValue(
        adapter,
        queryValueNumber,
        sectionBoundaries,
        localizedDigits,
        section,
      );

      return { sectionValue: newSectionValue, shouldGoToNextSection };
    };

    const getFirstSectionValueMatchingWithQuery: QueryApplier<TValue> = (
      queryValue,
      activeSection,
    ) => {
      if (
        activeSection.contentType === 'digit' ||
        activeSection.contentType === 'digit-with-letter'
      ) {
        return getNewSectionValue({
          queryValue,
          skipIfBelowMinimum: false,
          section: activeSection,
        });
      }

      // When editing a letter-format month and the user presses a digit,
      // We can support the numeric editing by using the digit-format month and re-formatting the result.
      if (activeSection.type === 'month') {
        const hasLeadingZerosInFormat = doesSectionFormatHaveLeadingZeros(
          adapter,
          'digit',
          'month',
          'MM',
        );

        const response = getNewSectionValue({
          queryValue,
          skipIfBelowMinimum: true,
          section: {
            type: activeSection.type,
            format: 'MM',
            hasLeadingZerosInFormat,
            hasLeadingZerosInInput: true,
            contentType: 'digit',
            maxLength: 2,
          },
        });

        if (isQueryResponseWithoutValue(response)) {
          return response;
        }

        const formattedValue = changeSectionValueFormat(
          adapter,
          response.sectionValue,
          'MM',
          activeSection.format,
        );

        return {
          ...response,
          sectionValue: formattedValue,
        };
      }

      // When editing a letter-format weekDay and the user presses a digit,
      // We can support the numeric editing by returning the nth day in the week day array.
      if (activeSection.type === 'weekDay') {
        const response = getNewSectionValue({
          queryValue,
          skipIfBelowMinimum: true,
          section: activeSection,
        });
        if (isQueryResponseWithoutValue(response)) {
          return response;
        }

        const formattedValue = getDaysInWeekStr(adapter, activeSection.format)[
          Number(response.sectionValue) - 1
        ];
        return {
          ...response,
          sectionValue: formattedValue,
        };
      }

      return { saveQuery: false };
    };

    return applyQuery(params, getFirstSectionValueMatchingWithQuery, (queryValue) =>
      isStringNumber(queryValue, localizedDigits),
    );
  };

  return useEventCallback((params: ApplyCharacterEditingParameters) => {
    const section = state.sections[params.sectionIndex];
    const isNumericEditing = isStringNumber(params.keyPressed, localizedDigits);
    const response = isNumericEditing
      ? applyNumericEditing({
          ...params,
          keyPressed: applyLocalizedDigits(params.keyPressed, localizedDigits),
        })
      : applyLetterEditing(params);
    if (response == null) {
      setTempAndroidValueStr(null);
      return;
    }

    updateSectionValue({
      section,
      newSectionValue: response.sectionValue,
      shouldGoToNextSection: response.shouldGoToNextSection,
    });
  });
};

export interface ApplyCharacterEditingParameters {
  keyPressed: string;
  sectionIndex: number;
}

interface UseFieldCharacterEditingParameters<TValue extends PickerValidValue> {
  stateResponse: UseFieldStateReturnValue<TValue>;
}

export type UseFieldCharacterEditingReturnValue = (params: ApplyCharacterEditingParameters) => void;

/**
 * The letter editing and the numeric editing each define a `CharacterEditingApplier`.
 * This function decides what the new section value should be and if the focus should switch to the next section.
 *
 * If it returns `null`, then the section value is not updated and the focus does not move.
 */
type CharacterEditingApplier = (
  params: ApplyCharacterEditingParameters,
) => { sectionValue: string; shouldGoToNextSection: boolean } | null;

/**
 * Function called by `applyQuery` which decides:
 * - what is the new section value ?
 * - should the query used to get this value be stored for the next key press ?
 *
 * If it returns `{ sectionValue: string; shouldGoToNextSection: boolean }`,
 * Then we store the query and update the section with the new value.
 *
 * If it returns `{ saveQuery: true` },
 * Then we store the query and don't update the section.
 *
 * If it returns `{ saveQuery: false },
 * Then we do nothing.
 */
type QueryApplier<TValue extends PickerValidValue> = (
  queryValue: string,
  activeSection: InferFieldSection<TValue>,
) => { sectionValue: string; shouldGoToNextSection: boolean } | { saveQuery: boolean };
