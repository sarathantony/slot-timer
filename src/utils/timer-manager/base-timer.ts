/**
 * Abstract class representing a basic timer.
 */
abstract class BaseTimer {
  /**
   * The duration for which the timer should run, in milliseconds.
   */
  protected duration: number;

  /**
   * The elapsed time since the timer started, in milliseconds.
   */
  protected elapsed: number = 0;

  /**
   * The interval timer reference. Used to clear the interval when needed.
   */
  protected timer: NodeJS.Timeout | null = null;

  /**
   * The timestamp when the timer was started or resumed.
   */
  protected startTime: number = 0;

  /**
   * Indicates whether the timer is currently paused.
   */
  protected isPaused: boolean = false;

  /**
   * Initializes a new instance of the BaseTimer class with a specified duration.
   * @param duration - The duration for the timer in milliseconds.
   */
  constructor(duration: number) {
    this.duration = duration;
  }

  /**
   * Starts the timer and begins counting down from the specified duration.
   * @param id - An identifier for the timer instance.
   */
  start(id: string) {
    this.startTime = performance.now();
    this.elapsed = 0;
    this.isPaused = false;
    this.timer = setInterval(() => this.tick(id), 1000);
  }

  /**
   * Pauses the timer, preserving the elapsed time.
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resumes the timer from where it was paused.
   */
  resume() {
    if (this.isPaused) {
      this.startTime = performance.now() - this.elapsed;
      this.isPaused = false;
    }
  }

  /**
   * Resets the timer to its initial state.
   */
  reset() {
    if (this.timer) clearInterval(this.timer);
    this.elapsed = 0;
    this.isPaused = false;
    this.onReset();
  }

  /**
   * Stops the timer and exits the process.
   */
  stop() {
    if (this.timer) clearInterval(this.timer);
    process.exit();
  }

  /**
   * Abstract method to handle the timer tick. Must be implemented by subclasses.
   * @param id - An identifier for the timer instance.
   */
  protected abstract tick(id: string): void;

  /**
   * Abstract method to handle actions when the timer is reset. Must be implemented by subclasses.
   */
  protected abstract onReset(): void;
}
