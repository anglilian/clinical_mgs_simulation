import { SimulationResults } from "../lib/types";
import { ChartAxis } from "./chart/ChartAxis";
import { DataLine } from "./chart/DataLine";
import { ChartLegend } from "./chart/ChartLegend";
import { createScales } from "./chart/ChartUtils";
import { DetectionMarkers } from "./chart/DetectionMarkers";
import { ConfidenceBand } from "./chart/ConfidenceBand";
import { DetectionImpact } from "./chart/DetectionImpact";

interface Props {
  results: SimulationResults | null;
}

export function SimulationChart({ results }: Props) {
  if (!results || !results.aggregatedData.length) return null;

  const maxValue = Math.max(
    ...results.aggregatedData.map((d) => d.avgInfected)
  );
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

      <div className="relative" style={{ height: "400px" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        >
          <ConfidenceBand
            xScale={xScale}
            height={height}
            padding={padding}
            firstDetectionDayCI={results.firstDetectionDay95CI}
            tenthDetectionDayCI={results.tenthDetectionDay95CI}
            firstDetectionDay={0}
            tenthDetectionDay={0}
          />
          <ChartAxis
            width={width}
            height={height}
            padding={padding}
            maxValue={maxValue}
            yScale={yScale}
            dataLength={results.aggregatedData.length}
            avgFirstDetectionDay={results.avgFirstDetectionDay}
            avgTenthDetectionDay={results.avgTenthDetectionDay}
            xScale={xScale}
          />

          <DataLine
            data={results.aggregatedData}
            xScale={xScale}
            yScale={yScale}
          />

          <DetectionMarkers
            xScale={xScale}
            height={height}
            padding={padding}
            firstDetectionDay={results.avgFirstDetectionDay}
            tenthDetectionDay={results.avgTenthDetectionDay}
            firstDetectionDayCI={results.firstDetectionDay95CI}
            tenthDetectionDayCI={results.tenthDetectionDay95CI}
            disease={results.disease}
          />
        </svg>
      </div>

      {results.disease.firstDetectionDay && (
        <DetectionImpact
          tenthDetectionDay={results.avgTenthDetectionDay}
          disease={results.disease}
        />
      )}
    </div>
  );
}
