import { parentPort } from 'worker_threads';

import { TimerResponse } from './worker.types';

import { formatTime } from '../common';
import { TIME_ZERO } from '../../constants/app-constants';

/**
 * CountdownTimer class that extends BaseTimer to implement countdown functionality.
 * It uses worker threads to handle timer operations asynchronously.
 */
class CountdownTimer extends BaseTimer {
    /**
     * Handles the tick event for the countdown timer.
     * Posts the remaining time to the parent thread.
     * @param {string} id - The unique identifier of the timer.
     */
    protected tick(id: string) {
        if (this.isPaused) return; // Do nothing if the timer is paused.

        const now = performance.now(); // Get the current time.
        this.elapsed = now - this.startTime; // Calculate elapsed time.
        const remaining = this.duration - this.elapsed; // Calculate remaining time.
        const timeString = formatTime(remaining); // Format remaining time into a human-readable string.

        // Check if the remaining time has reached zero.
        if (timeString === TIME_ZERO) {
            // Send a completion message to the parent thread.
            parentPort!.postMessage({ timeString, id, done: true } as TimerResponse);
            this.stop(); // Stop the timer.
        } else {
            // Send the current remaining time to the parent thread.
            parentPort!.postMessage({ timeString, id } as TimerResponse);
        }
    }

    /**
     * Handles the reset event for the countdown timer.
     * Resets the time to the initial duration and notifies the parent thread.
     */
    protected onReset() {
        // Send a reset message to the parent thread with time set to the initial duration.
        parentPort!.postMessage({ timeString: formatTime(this.duration), id: '' } as TimerResponse);
    }
}

export default CountdownTimer;
