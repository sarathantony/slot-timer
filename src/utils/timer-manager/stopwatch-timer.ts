import { parentPort } from "worker_threads";

import { TimerResponse } from "./worker.types";

import { formatTime } from "../common";
import { TIME_ZERO } from "../../constants/app-constants";

/**
 * StopwatchTimer class extends BaseTimer to implement a stopwatch functionality.
 * It uses worker threads to handle timer operations asynchronously.
 */
class StopwatchTimer extends BaseTimer {
    /**
     * Handles the tick event for the stopwatch.
     * Posts the current elapsed time to the parent thread.
     * @param {string} id - The unique identifier of the timer.
     */
    protected tick(id: string) {
        if (this.isPaused) return; // Do nothing if the timer is paused.

        const now = performance.now(); // Get the current time.
        this.elapsed = now - this.startTime; // Calculate elapsed time.
        const timeString = formatTime(this.elapsed); // Format elapsed time into a human-readable string.

        // Check if the elapsed time has reached or exceeded the duration.
        if (this.elapsed >= this.duration) {
            // Send a completion message to the parent thread.
            parentPort!.postMessage({ timeString: formatTime(this.duration), id, done: true } as TimerResponse);
            this.stop(); // Stop the timer.
        } else {
            // Send the current time string to the parent thread.
            parentPort!.postMessage({ timeString, id } as TimerResponse);
        }
    }

    /**
     * Handles the reset event for the stopwatch.
     * Resets the time to zero and notifies the parent thread.
     */
    protected onReset() {
        // Send a reset message to the parent thread with time set to '00:00:00'.
        parentPort!.postMessage({ timeString: TIME_ZERO, id: '' } as TimerResponse);
    }
}

export default StopwatchTimer;
