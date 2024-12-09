import React from 'react';
import { SimulationResults } from '../lib/types';
import { ChartAxis } from './chart/ChartAxis';
import { DataLine } from './chart/DataLine';
import { ChartLegend } from './chart/ChartLegend';
import { createScales } from './chart/ChartUtils';

interface Props {
  results: SimulationResults | null;
}

export function SimulationChart({ results }: Props) {
  if (!results || !results.aggregatedData.length) return null;

  const maxValue = Math.max(...results.aggregatedData.map(d => d.avgInfected));
  const width = 800;
  const height = 400;
  const padding = 60;
  
  const { xScale, yScale } = createScales(
    width,
    height,
    padding,
    results.aggregatedData,
    maxValue
  );

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow">
      <ChartLegend completedRuns={results.completedRuns} />
      
      <div className="relative" style={{ height: '400px' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        >
          <ChartAxis
            width={width}
            height={height}
            padding={padding}
            maxValue={maxValue}
            yScale={yScale}
            dataLength={results.aggregatedData.length}
          />
          
          <DataLine
            data={results.aggregatedData}
            xScale={xScale}
            yScale={yScale}
          />
        </svg>
      </div>
      
      <div className="mt-6 text-sm text-gray-600 space-y-1">
        <p>Average first case detection: Day {results.avgFirstDetectionDay.toFixed(1)}</p>
        <p>Average tenth case detection: Day {results.avgTenthDetectionDay.toFixed(1)}</p>
      </div>
    </div>
  );
}