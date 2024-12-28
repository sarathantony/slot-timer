import generateUniqueId from "../signature/id";

import { TimerInstance, TimerOptions } from "./heartbeat.types";

/**
 * TimerManager: Allows to create a timer.
 */
class TimerManager {
  private static instances: Map<string, Worker | any> = new Map();

  static createTimer(options: TimerOptions): TimerInstance {
    const id = generateUniqueId();

    if (typeof window !== "undefined" && typeof Worker !== "undefined") {
      // Browser Environment
      const worker = new Worker(
        URL.createObjectURL(
          new Blob(
            [
              `
              self.onmessage = ({ data }) => {
                const { duration, type, id } = data;
                let elapsed = 0;
                const interval = 1000;
                const start = Date.now();

                const formatTime = (ms) => {
                  const totalSeconds = Math.floor(ms / 1000);
                  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
                  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
                  const seconds = String(totalSeconds % 60).padStart(2, '0');
                  return \`\${hours}:\${minutes}:\${seconds}\`;
                };

                const tick = () => {
                  const now = Date.now();
                  elapsed = now - start;

                  let remaining;
                  if (type === "countdown") {
                    remaining = duration - elapsed;
                    if (remaining <= 0) {
                      self.postMessage({ timeString: "00:00:00", id, done: true });
                      clearInterval(timer);
                      self.close();
                      return;
                    }
                    self.postMessage({ timeString: formatTime(remaining), id });
                  } else if (type === "stopwatch") {
                    if (elapsed >= duration) {
                      self.postMessage({ timeString: formatTime(duration), id, done: true });
                      clearInterval(timer);
                      self.close();
                      return;
                    }
                    self.postMessage({ timeString: formatTime(elapsed), id });
                  }
                };

                tick(); // Immediate first tick
                const timer = setInterval(tick, interval);
              };
            `
            ],
            { type: "application/javascript" }
          )
        )
      );

      worker.postMessage({ duration: options.duration, type: options.type, id });

      worker.onmessage = (event) => {
        const { timeString, id, done } = event.data;
        if (options.onTick) options.onTick(timeString, id);
        if (done && options.onComplete) options.onComplete(id);
      };

      this.instances.set(id, worker);
    } else if (typeof process !== "undefined" && typeof require !== "undefined") {
      // Node.js Environment
      const { Worker } = require("worker_threads");
      const worker = new Worker(`
        const { parentPort } = require('worker_threads');
        parentPort.on('message', ({ duration, type, id }) => {
          let elapsed = 0;
          const interval = 1000;
          const start = Date.now();

          const formatTime = (ms) => {
            const totalSeconds = Math.floor(ms / 1000);
            const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(totalSeconds % 60).padStart(2, '0');
            return \`\${hours}:\${minutes}:\${seconds}\`;
          };

          const tick = () => {
            const now = Date.now();
            elapsed = now - start;

            let remaining;
            if (type === "countdown") {
              remaining = duration - elapsed;
              if (remaining <= 0) {
                parentPort.postMessage({ timeString: "00:00:00", id, done: true });
                clearInterval(timer);
                return;
              }
              parentPort.postMessage({ timeString: formatTime(remaining), id });
            } else if (type === "stopwatch") {
              if (elapsed >= duration) {
                parentPort.postMessage({ timeString: formatTime(duration), id, done: true });
                clearInterval(timer);
                return;
              }
              parentPort.postMessage({ timeString: formatTime(elapsed), id });
            }
          };

          tick(); // Immediate first tick
          const timer = setInterval(tick, interval);
        });
      `, { eval: true });

      worker.postMessage({ duration: options.duration, type: options.type, id });

      worker.on("message", (message: { timeString: string; id: string; done?: boolean }) => {
        const { timeString, id, done } = message;
        if (options.onTick) options.onTick(timeString, id);
        if (done && options.onComplete) options.onComplete(id);
      });

      this.instances.set(id, worker);
    } else {
      throw new Error("Unsupported environment for Timer");
    }

    return {
      id,
      stop: () => this.stopTimer(id),
    };
  }

  static stopTimer(id: string): void {
    const worker = this.instances.get(id);
    if (worker) {
      if (typeof worker.terminate === "function") {
        worker.terminate(); // Browser
      } else if (typeof worker.postMessage === "function") {
        worker.postMessage({ stop: true }); // Node.js
      }
      this.instances.delete(id);
    }
  }
}

export default TimerManager;
