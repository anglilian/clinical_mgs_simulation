import {
  SimulationState,
  SimulationParams,
  SimulationResults,
  AggregatedState,
} from "./types";
import { initializeSimulation, simulateStep } from "./simulation";
import { calculateConfidenceInterval } from "./statisticsUtils";

export function runMonteCarloSimulation(
  params: SimulationParams,
  onProgress: (results: SimulationResults) => void
): void {
  let completedRuns = 0;
  let allRunsData: SimulationState[][] = [];
  let firstDetectionDays: number[] = [];
  let tenthDetectionDays: number[] = [];

  const runSimulation = () => {
    let state = initializeSimulation(params);
    let stateHistory: SimulationState[] = [state];

    while (true) {
      state = simulateStep(state, params);
      stateHistory.push(state);

      if (
        ((state.infected === 0 && state.exposed === 0) ||
          state.tenthDetectionDay !== null) &&
        state.day >= 20
      ) {
        break;
      }
    }

    return stateHistory;
  };

  const processRun = () => {
    const runData = runSimulation();
    allRunsData.push(runData);
    completedRuns++;

    if (runData[runData.length - 1].firstDetectionDay !== null) {
      firstDetectionDays.push(runData[runData.length - 1].firstDetectionDay!);
    }
    if (runData[runData.length - 1].tenthDetectionDay !== null) {
      tenthDetectionDays.push(runData[runData.length - 1].tenthDetectionDay!);
    }

    // Calculate aggregated results
    const maxDays = Math.max(...allRunsData.map((run) => run.length));
    const aggregatedData: AggregatedState[] = [];

    for (let day = 0; day < maxDays; day++) {
      let totalCumulativeInfected = 0;
      let runsWithDay = 0;

      allRunsData.forEach((run) => {
        if (run[day]) {
          totalCumulativeInfected += run[day].infected + run[day].recovered;
          runsWithDay++;
        }
      });

      aggregatedData.push({
        day,
        avgInfected: totalCumulativeInfected / runsWithDay,
      });
    }

    const firstDetectionDay95CI =
      calculateConfidenceInterval(firstDetectionDays);
    const tenthDetectionDay95CI =
      calculateConfidenceInterval(tenthDetectionDays);

    const results: SimulationResults = {
      aggregatedData,
      avgFirstDetectionDay:
        firstDetectionDays.length > 0
          ? firstDetectionDays.reduce((a, b) => a + b) /
            firstDetectionDays.length
          : 0,
      avgTenthDetectionDay:
        tenthDetectionDays.length > 0
          ? tenthDetectionDays.reduce((a, b) => a + b) /
            tenthDetectionDays.length
          : 0,
      firstDetectionDay95CI,
      tenthDetectionDay95CI,
      completedRuns,
      disease: params.disease,
    };

    onProgress(results);

    if (completedRuns < params.numRuns) {
      setTimeout(processRun, 0);
    }
  };

  processRun();
}
