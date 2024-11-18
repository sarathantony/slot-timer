import heartBeat from "../utils/heart-beat/heart-beat";
import { TickCallback, TimerProps } from "../utils/heart-beat/heat-beat.types";

/**
 *
 * @param id [string] - Unique identifier
 * @param callback [Function] - Callback function
 * @returns
 */
function stopWatch(id: string, callback: TickCallback): TimerProps {
  const { start, pause, resume, reset, stop } = heartBeat((elapsedSeconds, workerId) => {
    if (workerId === id) {
      callback(elapsedSeconds, id); // Callback with the elapsed time
    }
  }, id);

  return { start, pause, resume, reset, stop };
}

export default stopWatch;
