import { formatTime } from '../common';

let timer: NodeJS.Timeout | null = null;
let startTime: number = 0;
let elapsed: number = 0;
let isPaused: boolean = false;

/**
 * Handles incoming messages in the web worker and executes timer commands such as "start", "pause", "resume", "reset", and "stop".
 * The worker handles both countdown and stopwatch timer types, posting updates back to the main thread.
 *
 * @param event - The event containing the message data with the command and other relevant parameters.
 * @param event.data - The data sent from the main thread containing the timer command and configuration.
 * @param event.data.command - The command to execute (e.g., "start", "pause", "resume", "reset", "stop").
 * @param event.data.duration - The duration for countdown or stopwatch in milliseconds (optional).
 * @param event.data.type - The type of timer, either "countdown" or "stopwatch" (optional).
 * @param event.data.id - The unique identifier for the timer instance (optional).
 */
self.onmessage = ({ data }: MessageEvent<{ command: string; duration?: number; type?: "countdown" | "stopwatch"; id?: string }>) => {
  const { command, duration, type, id } = data;

  switch (command) {
    /**
     * Starts the timer based on the specified type ("countdown" or "stopwatch").
     * - For countdown: The timer counts down from the specified duration.
     * - For stopwatch: The timer counts up from zero.
     */
    case "start":
      if (type === "countdown" || type === "stopwatch") {
        startTime = performance.now();
        elapsed = 0;
        isPaused = false;

        /**
         * Updates the timer on each tick (every second).
         * Sends the formatted time to the main thread.
         *
         * - For countdown: Sends remaining time until zero.
         * - For stopwatch: Sends elapsed time since the start.
         * Terminates the timer when the countdown reaches zero or the stopwatch reaches its set duration.
         */
        const tick = () => {
          if (isPaused) return;

          const now = performance.now();
          elapsed = now - startTime;

          if (type === "countdown") {
            const remaining = (duration ?? 0) - elapsed;
            if (remaining <= 0) {
              self.postMessage({ timeString: "00:00:00", id, done: true });
              clearInterval(timer!);
              self.close();
              return;
            }
            self.postMessage({ timeString: formatTime(remaining), id });
          } else if (type === "stopwatch") {
            if (elapsed >= (duration || 0)) {
              self.postMessage({ timeString: formatTime(duration ?? 0), id, done: true });
              clearInterval(timer!);
              self.close();
              return;
            }
            self.postMessage({ timeString: formatTime(elapsed), id });
          }
        };

        tick(); // Immediate first tick
        timer = setInterval(tick, 1000);
      }
      break;

    /**
     * Pauses the timer, preventing further ticks until resumed.
     */
    case "pause":
      isPaused = true;
      break;
    /**
     * Resumes the timer from the paused state.
     * Adjusts the start time to account for elapsed time before the pause.
     */
    case "resume":
      if (isPaused) {
        startTime = performance.now() - elapsed;
        isPaused = false;
      }
      break;

    /**
     * Resets the timer to zero, stopping any ongoing interval and sending the reset time back to the main thread.
     */
    case "reset":
      if (timer) clearInterval(timer);
      elapsed = 0;
      isPaused = false;
      self.postMessage({ timeString: formatTime(duration ?? 0), id });
      break;

    /**
     * Stops the timer and closes the worker.
     */
    case "stop":
      if (timer) clearInterval(timer);
      self.close();
      break;
  }
};
