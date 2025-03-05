'use client';
import type { RadarChartProps } from './RadarChart';
import { ChartsOverlayProps } from '../ChartsOverlay';
import { ChartsLegendSlotExtension } from '../ChartsLegend';
import type { ChartsWrapperProps } from '../internals/components/ChartsWrapper';
import { RadarDataProviderProps } from './RadarDataProvider/RadarDataProvider';
import { ChartsSurfaceProps } from '../ChartsSurface';
import { RadarGridProps } from './RadarGrid/RadarGrid';

/**
 * A helper function that extracts RadarChartProps from the input props
 * and returns an object with props for the children components of RadarChart.
 *
 * @param props The input props for RadarChart
 * @returns An object with props for the children components of RadarChart
 */
export const useRadarChartProps = (props: RadarChartProps) => {
  const {
    series,
    radar,
    width,
    height,
    margin,
    colors,
    sx,
    children,
    slots,
    slotProps,
    skipAnimation,
    loading,
    highlightedItem,
    onHighlightChange,
    hideLegend,
    divisions,
    ...other
  } = props;

  const radarDataProviderProps: RadarDataProviderProps = {
    series,
    radar,
    width,
    height,
    margin,
    colors,
    highlightedItem,
    onHighlightChange,
    skipAnimation,
  };

  const overlayProps: ChartsOverlayProps = {
    slots,
    slotProps,
    loading,
  };

  const legendProps: ChartsLegendSlotExtension = {
    slots,
    slotProps,
  };

  const chartsWrapperProps: Omit<ChartsWrapperProps, 'children'> = {
    sx,
  };

  const radarGrid: RadarGridProps = { divisions };

  const chartsSurfaceProps: ChartsSurfaceProps = other;

  return {
    chartsWrapperProps,
    chartsSurfaceProps,
    radarDataProviderProps,
    radarGrid,
    overlayProps,
    legendProps,
    children,
  };
};
