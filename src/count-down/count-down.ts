import heartBeat from "../utils/heart-beat/heart-beat";
import { TickCallback } from "../utils/heart-beat/heat-beat.types";

/**
 * countDown: CountDown timer.
 * @param initialTime [number]* - Initial time in milliseconds
 * @param id [string]* - To keep track of the instance
 * @param callback [Function]* - Callback function
 */
function countdown(initialTime: number, id: string, callback: TickCallback) {
  let timeRemaining = initialTime;

  const { start, pause, resume, reset, stop } = heartBeat((elapsedSeconds, workerId) => {
    if (workerId === id) {
      timeRemaining = initialTime - elapsedSeconds;

      if (timeRemaining <= 0) {
        stop(); // Stop the timer when reaching zero
        callback(0, id); // Final callback with 0 seconds
      } else {
        callback(timeRemaining, id); // Callback with remaining time
      }
    }
  }, id);

  const resetCountdown = () => {
    timeRemaining = initialTime;
    reset();
    callback(timeRemaining, id);
  };

  return { start, pause, resume, reset: resetCountdown, stop };
}

export default countdown;
