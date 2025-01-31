/**
 * Formats a given time in milliseconds into a string in the format "HH:MM:SS".
 *
 * @param ms - The time in milliseconds to be formatted.
 * @returns A string representing the formatted time in the "HH:MM:SS" format.
 *
 * @example
 * // returns "01:05:23"
 * formatTime(3923000);
 */
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};
