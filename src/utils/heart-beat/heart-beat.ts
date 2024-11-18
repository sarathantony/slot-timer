/// <reference path="../tick/tick-worker.d.ts" />
import TickWorker from "worker-loader!./tickWorker.ts";

import { TickCallback, TimerProps } from "./heat-beat.types";

import generateUniqueId from "../signature/id";

/**
 * heartBeat
 * @param callback [Function]* - Callback
 * @param id [string]* - A unique identifier tracker.
 * @returns [TimerProps]
 */
export default function heartBeat(callback: TickCallback, id: string = generateUniqueId()): TimerProps {
  if (typeof Worker === "undefined") {
    throw new Error("Web Workers are not supported in this environment.");
  }

  const worker = new TickWorker();

  worker.onmessage = (event: MessageEvent) => {
    const { id: workerId, count } = event.data as { id: string; count: number };
    callback(count, workerId); // Pass the unique ID to the callback
  };

  // Start the worker's tick process with the ID
  worker.postMessage({ command: "start", id });

  // Functions to control the timer
  const start = () => worker.postMessage({ command: "start", id });
  const pause = () => worker.postMessage({ command: "pause", id });
  const resume = () => worker.postMessage({ command: "continue", id });
  const reset = () => worker.postMessage({ command: "reset", id });

  // Return control functions and cleanup function
  return { start, pause, resume, reset, stop: () => worker.terminate() };
}