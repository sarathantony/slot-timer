import path from 'path';
import { Worker } from 'worker_threads';

import { TimerInstance, TimerOptions, WorkerMessage, WorkerResponse } from "./timer-manager.types";

import generateUniqueId from "../signature/id";

/**
 * Manages timer instances using worker threads.
 */
class TimerManager {
    // Map to store active worker instances keyed by their unique IDs.
    private static readonly instances: Map<string, Worker> = new Map();

    /**
     * Creates a new timer instance.
     * @param {TimerOptions} options - Configuration options for the timer.
     * @returns {TimerInstance} The created timer instance with control methods.
     */
    static createTimer(options: TimerOptions): TimerInstance {
        let id = generateUniqueId();

        // Ensure the generated ID is unique.
        while (this.instances.has(id)) {
            id = generateUniqueId();
        }

        // Initialize a new worker for the timer.
        const worker = this.initializeWorker(options);

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

        // Set up listeners for worker messages and errors.
        this.setupWorkerListeners(worker, options, id);

        // Return timer instance with control methods.
        return {
            id,
            /**
             * Starts the timer.
             */
            start: () => worker.postMessage({ command: "start", duration: options.duration, type: options.type, id } as WorkerMessage),
            /**
             * Stops the timer and removes it from the instance map.
             */
            stop: () => this.stopWorker(worker, id),
            /**
             * Pauses the timer.
             */
            pause: () => worker.postMessage({ command: "pause" } as WorkerMessage),
            /**
             * Resumes the timer.
             * */
            resume: () => worker.postMessage({ command: "resume" } as WorkerMessage),
            /**
             * Resets the timer.
             * */
            reset: () => worker.postMessage({ command: "reset", duration: options.duration, id } as WorkerMessage),
        };
    }

    /**
     * Initializes a worker thread for the timer.
     * @param {TimerOptions} options - Configuration options for the timer.
     * @returns {Worker} The initialized worker instance.
     * @throws Will throw an error if the environment is unsupported.
     */
    private static initializeWorker(options: TimerOptions): Worker {
        try {
            if (typeof window !== "undefined" && typeof Worker !== "undefined") {
              // BROWSER ENVIRONMENT..
              const workerPath = path.resolve(__dirname, '/worker.js');

              return new Worker(workerPath);
            } else if (typeof process !== "undefined" && typeof require !== "undefined") {
              // NODE.JS ENVIRONMENT..
              const { Worker } = require("worker_threads");
              return new Worker(__dirname + "/node-worker.js");
            }

            throw new Error("Unsupported environment for Timer");
        } catch (error) {
            console.error("Worker initialization failed:", error);

            if (options.onError) options.onError(error as Error);
            throw error;
        }
    }

    /**
     * Sets up event listeners for the worker.
     * @param {Worker} worker - The worker instance.
     * @param {TimerOptions} options - Configuration options for the timer.
     * @param {string} id - The unique ID of the timer.
     */
    private static setupWorkerListeners(worker: Worker, options: TimerOptions, id: string) {
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
            const { timeString, done = false } = data;

            if (options.onTick) options.onTick(timeString, id, done);
            if (done && options.onComplete) {
                options.onComplete(id);
                worker.postMessage({ command: "stop" });
                this.instances.delete(id);
            }
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
    }

    /**
     * Stops and terminates the worker for a given timer.
     * @param {Worker} worker - The worker instance.
     * @param {string} id - The unique ID of the timer.
     */
    private static stopWorker(worker: Worker, id: string) {
        worker.postMessage({ command: "stop" } as WorkerMessage);
        worker.terminate();
        this.instances.delete(id);
    }
}

export default TimerManager;
