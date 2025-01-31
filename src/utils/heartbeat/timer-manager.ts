
import path from 'path';
import { Worker } from 'worker_threads';

import { TimerInstance, TimerOptions, WorkerMessage, WorkerResponse } from "./timer-manager.types";

import generateUniqueId from "../signature/id";

/**
 * Manages the creation, operation, and lifecycle of timers in different environments.
 * Timers are implemented using Web Workers in the browser and Worker Threads in Node.js.
 */
class TimerManager {
  /**
   * A static map storing the instances of workers by their unique IDs.
   * Used to track active timers.
   */
  private static readonly instances: Map<string, Worker> = new Map();

  /**
   * Creates a new timer with the specified options.
   *
   * @param options - The options to configure the timer.
   * @returns A TimerInstance that provides control over the created timer.
   *
   * @throws Error if the environment is neither a browser nor Node.js.
   */
  static createTimer(options: TimerOptions): TimerInstance {
    const id = generateUniqueId();
    let worker: Worker;

    if (typeof window !== "undefined" && typeof Worker !== "undefined") {
      // BROWSER ENVIRONMENT..
      const workerPath = path.resolve(__dirname, '/worker.js');
      worker = new Worker(workerPath);
    } else if (typeof process !== "undefined" && typeof require !== "undefined") {
      // NODE.JS ENVIRONMENT..
      const { Worker } = require("worker_threads");
      worker = new Worker(__dirname + "/node-worker.js");
    } else {
      throw new Error("Unsupported environment for Timer");
    }

    /**
     * Sends an initialization message to the worker, passing the timer configuration options.
     * The worker will set up based on the duration, type, and other settings passed in the options.
     *
     * @param command - The command to initialize the worker (`"init"`).
     * @param duration - The duration for the timer.
     * @param type - The type of timer (e.g., countdown, stopwatch).
     * @param id - A unique identifier for the timer instance.
     * @throws Error if worker initialization fails.
     */
    worker.postMessage({ command: "init", duration: options.duration, type: options.type, id } as WorkerMessage);

    /**
     * Listener for messages from the worker.
     * Handles the timer's tick updates and completion status.
     *
     * @param data - The response data from the worker, typically containing the updated time string,
     *               the timer ID, and whether the timer has completed.
     * @param data.timeString - The current time of the timer as a string.
     * @param data.id - The unique identifier of the timer instance.
     * @param data.done - A boolean indicating if the timer has completed.
     *
     * @fires options.onTick - Invoked when the timer sends a tick update.
     * @fires options.onComplete - Invoked when the timer completes.
     */
    worker.on('message', (data: WorkerResponse) => {
      const { timeString, id, done } = data;
      if (options.onTick) options.onTick(timeString, id);
      if (done && options.onComplete) options.onComplete(id);
    });

    /**
     * Listener for error events from the worker.
     * Logs the error and invokes the provided onError callback if defined.
     *
     * @param error - The error object received from the worker.
     *
     * @fires options.onError - Invoked when an error occurs in the worker.
     */
    worker.on('error', (error: Error) => {
      console.error("Worker error:", error);
      if (options.onError) options.onError(error);
    });

    /**
     * Stores the newly created worker in the `instances` map by its unique ID.
     * This allows tracking and managing active timers.
     *
     * @param id - The unique identifier of the timer instance.
     * @param worker - The Worker instance responsible for handling the timer's logic.
     *
     * @throws Error if there is an issue adding the worker to the instances map.
     */
    this.instances.set(id, worker);

    return {
      id,
      /**
       * Starts the timer.
       */
      start: () => worker.postMessage({ command: "start", duration: options.duration, type: options.type, id } as WorkerMessage),
      /**
       * Stops the timer and removes it from the instance map.
       */
      stop: () => {
        worker.postMessage({ command: "stop" } as WorkerMessage);
        this.instances.delete(id);
      },
      /**
       * Pauses the timer.
       */
      pause: () => worker.postMessage({ command: "pause" } as WorkerMessage),
      /**
       * Resumes the timer after being paused.
       */
      resume: () => worker.postMessage({ command: "resume" } as WorkerMessage),
      /**
       * Resets the timer to its initial state.
       */
      reset: () => worker.postMessage({ command: "reset", duration: options.duration, id } as WorkerMessage),
    };
  }
}

export default TimerManager;
