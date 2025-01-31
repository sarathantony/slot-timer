import { parentPort } from 'worker_threads';

import { TimerCommand, TimerResponse } from './worker.types';

import { formatTime } from '../common';

let timer: NodeJS.Timeout | null = null;
let startTime: number = 0;
let elapsed: number = 0;
let isPaused: boolean = false;

if (parentPort) {
  /**
   * Listens for incoming messages from the parent thread and executes commands for timer control.
   *
   * @param data - The incoming message containing a command and other related data (e.g., duration, type, and id).
   */
  parentPort.on('message', (data: TimerCommand) => {
    const { command, duration, type, id } = data;

    switch (command) {
      /**
       * Starts the timer with the given configuration (either countdown or stopwatch).
       *
       * - For a countdown timer, it counts down from the specified duration.
       * - For a stopwatch, it starts counting up from zero.
       */
      case "start":
        if (type === "countdown" || type === "stopwatch") {
          startTime = performance.now();
          elapsed = 0;
          isPaused = false;

          /**
           * Ticks the timer every second and sends updates to the parent thread.
           *
           * - For countdown: Sends remaining time until the timer hits zero.
           * - For stopwatch: Sends elapsed time since the start.
           * Terminates when the timer reaches the end for countdown or the specified duration for stopwatch.
           */
          const tick = () => {
            if (isPaused) return;
            const now = performance.now();
            elapsed = now - startTime;

            if (type === "countdown") {
              const remaining = (duration || 0) - elapsed;
              if (remaining <= 0) {
                parentPort!.postMessage({ timeString: "00:00:00", id, done: true } as TimerResponse);
                clearInterval(timer!);
                process.exit();
              } else {
                parentPort!.postMessage({ timeString: formatTime(remaining), id } as TimerResponse);
              }
            } else if (type === "stopwatch") {
              if (elapsed >= (duration || 0)) {
                parentPort!.postMessage({ timeString: formatTime(duration || 0), id, done: true } as TimerResponse);
                clearInterval(timer!);
                process.exit();
              } else {
                parentPort!.postMessage({ timeString: formatTime(elapsed), id } as TimerResponse);
              }
            }
          };

          tick(); // Immediate first tick
          timer = setInterval(tick, 1000);
        }
        break;

      /**
       * Pauses the timer.
       * The timer can be resumed later using the "resume" command.
       */
      case "pause":
        isPaused = true;
        break;

      /**
       * Resumes the timer from where it was paused.
       * Adjusts the start time to account for the elapsed time.
       */
      case "resume":
        if (isPaused) {
          startTime = performance.now() - elapsed;
          isPaused = false;
        }
        break;

      /**
       * Resets the timer to zero and stops any ongoing interval.
       * Sends the reset time to the parent thread.
       */
      case "reset":
        if (timer) clearInterval(timer);
        elapsed = 0;
        isPaused = false;
        parentPort!.postMessage({ timeString: formatTime(duration || 0), id } as TimerResponse);
        break;

      /**
       * Stops the timer and exits the process.
       */
      case "stop":
        if (timer) clearInterval(timer);
        process.exit();
        break;
    }
  });
}
