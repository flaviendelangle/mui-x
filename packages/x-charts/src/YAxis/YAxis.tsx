import * as React from 'react';
import PropTypes from 'prop-types';
import { unstable_composeClasses as composeClasses } from '@mui/utils';
import { useThemeProps, useTheme, Theme } from '@mui/material/styles';
import { CartesianContext } from '../context/CartesianContextProvider';
import { DrawingContext } from '../context/DrawingProvider';
import useTicks from '../hooks/useTicks';
import { YAxisProps } from '../models/axis';
import {
  Line,
  Tick,
  TickLabel,
  Label,
  AxisRoot,
} from '../internals/components/AxisSharedComponents';
import { getAxisUtilityClass } from '../Axis/axisClasses';

const useUtilityClasses = (ownerState: YAxisProps & { theme: Theme }) => {
  const { classes, position } = ownerState;
  const slots = {
    root: ['root', 'directionY', position],
    line: ['line'],
    tickContainer: ['tickContainer'],
    tick: ['tick'],
    tickLabel: ['tickLabel'],
    label: ['label'],
  };

  return composeClasses(slots, getAxisUtilityClass, classes);
};

const defaultProps = {
  position: 'left',
  hidden: false,
  disableLine: false,
  disableTicks: false,
  tickFontSize: 12,
  labelFontSize: 14,
  tickSize: 6,
} as const;

function YAxis(inProps: YAxisProps) {
  const props = useThemeProps({ props: inProps, name: 'MuiYAxis' });
  const {
    yAxis: {
      [props.axisId]: { scale: yScale, ticksNumber, ...settings },
    },
  } = React.useContext(CartesianContext);

  const defaultizedProps = { ...defaultProps, ...settings, ...props };
  const {
    position,
    hidden,
    disableLine,
    disableTicks,
    tickFontSize,
    label,
    labelFontSize,
    tickSize: tickSizeProp,
  } = defaultizedProps;

  const theme = useTheme();
  const classes = useUtilityClasses({ ...defaultizedProps, theme });

  const { left, top, width, height } = React.useContext(DrawingContext);

  const tickSize = disableTicks ? 4 : tickSizeProp;

  const yTicks = useTicks({ scale: yScale, ticksNumber });

  const positionSigne = position === 'right' ? 1 : -1;

  const labelRefPoint = {
    x: positionSigne * (tickFontSize + tickSize + 10),
    y: top + height / 2,
  };

  if (hidden) {
    return null;
  }

  return (
    <AxisRoot
      transform={`translate(${position === 'right' ? left + width : left}, 0)`}
      className={classes.root}
    >
      {!disableLine && (
        <Line y1={yScale.range()[0]} y2={yScale.range()[1]} className={classes.line} />
      )}

      {yTicks.map(({ value, offset }, index) => (
        <g key={index} transform={`translate(0, ${offset})`} className={classes.tickContainer}>
          {!disableTicks && <Tick x2={positionSigne * tickSize} className={classes.tick} />}
          <TickLabel
            x={`${positionSigne * (tickSize + 2)}`}
            sx={{
              fontSize: tickFontSize,
            }}
            className={classes.tickLabel}
          >
            {value}
          </TickLabel>
        </g>
      ))}

      {label && (
        <Label
          {...labelRefPoint}
          sx={{
            fontSize: labelFontSize,
            transform: `rotate(${positionSigne * 90}deg)`,
            transformOrigin: `${labelRefPoint.x}px ${labelRefPoint.y}px`,
          }}
          className={classes.label}
        >
          {label}
        </Label>
      )}
    </AxisRoot>
  );
}

YAxis.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Id of the axis to render.
   */
  axisId: PropTypes.string.isRequired,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * If true, the axis line is disabled.
   * @default false
   */
  disableLine: PropTypes.bool,
  /**
   * If true, the ticks are disabled.
   * @default false
   */
  disableTicks: PropTypes.bool,
  /**
   * The fill color of the axis text.
   * @default 'currentColor'
   */
  fill: PropTypes.string,
  /**
   * If true, the axis will not be rendered.
   * @default false
   */
  hidden: PropTypes.bool,
  /**
   * The label of the axis.
   */
  label: PropTypes.string,
  /**
   * The font size of the axis label.
   * @default 14
   */
  labelFontSize: PropTypes.number,
  /**
   * Position of the axis.
   */
  position: PropTypes.oneOf(['left', 'right']),
  /**
   * The stroke color of the axis line.
   * @default 'currentColor'
   */
  stroke: PropTypes.string,
  /**
   * The font size of the axis ticks text.
   * @default 12
   */
  tickFontSize: PropTypes.number,
  /**
   * The size of the ticks.
   * @default 6
   */
  tickSize: PropTypes.number,
} as any;

export { YAxis };
