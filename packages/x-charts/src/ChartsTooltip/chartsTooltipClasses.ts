import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface ChartsTooltipClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the table element. */
  table: string;
  /** Styles applied to the row element. */
  row: string;
  /** Styles applied to the cell element. */
  cell: string;
  /** Styles applied to the mark element. */
  mark: string;
  /** Styles applied to the markCell element. */
  markCell: string;
  /** Styles applied to the labelCell element. */
  labelCell: string;
  /** Styles applied to the valueCell element. */
  valueCell: string;
}

export type ChartsTooltipClassKey = keyof Omit<
  ChartsTooltipClasses,
  // these classes are not used for styled components
  'markCell' | 'labelCell' | 'valueCell'
>;

export function getChartsTooltipUtilityClass(slot: string) {
  return generateUtilityClass('MuiChartsTooltip', slot);
}
export const chartsTooltipClasses: ChartsTooltipClasses = generateUtilityClasses(
  'MuiChartsTooltip',
  ['root', 'table', 'row', 'cell', 'mark', 'markCell', 'labelCell', 'valueCell'],
);
