/**
 * Get current timestamp in seconds
 */
export const nowInSeconds = (): number => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Get current timestamp in milliseconds
 */
export const nowInMilliseconds = (): number => {
  return Date.now();
};

/**
 * Add seconds to current time and return timestamp in seconds
 */
export const addSeconds = (seconds: number): number => {
  return nowInSeconds() + seconds;
};

/**
 * Add minutes to current time and return timestamp in seconds
 */
export const addMinutes = (minutes: number): number => {
  return nowInSeconds() + minutes * 60;
};

/**
 * Add hours to current time and return timestamp in seconds
 */
export const addHours = (hours: number): number => {
  return nowInSeconds() + hours * 60 * 60;
};

/**
 * Add days to current time and return timestamp in seconds
 */
export const addDays = (days: number): number => {
  return nowInSeconds() + days * 24 * 60 * 60;
};

/**
 * Check if timestamp is expired
 */
export const isExpired = (timestamp: number): boolean => {
  return timestamp < nowInSeconds();
};

/**
 * Format date to ISO string
 */
export const toISOString = (date?: Date): string => {
  return (date || new Date()).toISOString();
};
