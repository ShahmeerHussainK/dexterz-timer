export interface TimeWindow {
    start: string;
    end: string;
}
export interface ScheduleRules {
    timezone: string;
    checkinWindow: TimeWindow;
    breakWindow: TimeWindow;
    idleThresholdSeconds: number;
}
/**
 * Check if a timestamp falls within the check-in window
 * Handles midnight crossing (e.g., 16:50 -> 02:00 next day)
 */
export declare function isWithinCheckinWindow(timestamp: Date, rules: ScheduleRules): boolean;
/**
 * Check if a timestamp falls within the break window
 */
export declare function isWithinBreakWindow(timestamp: Date, rules: ScheduleRules): boolean;
/**
 * Get the current time in the organization's timezone
 */
export declare function getCurrentTimeInTz(timezone: string): Date;
/**
 * Convert a local time string to UTC
 */
export declare function localTimeToUtc(dateStr: string, timeStr: string, timezone: string): Date;
/**
 * Format a date in the organization's timezone
 */
export declare function formatInTz(date: Date, formatStr: string, timezone: string): string;
/**
 * Get the start and end of a day in the organization's timezone
 */
export declare function getDayBoundariesInTz(date: Date, timezone: string): {
    start: Date;
    end: Date;
};
/**
 * Get the working date for a timestamp based on check-in window
 * If time is before checkin end (e.g., 02:00), it belongs to previous day's shift
 * Example: 01:30 AM on Jan 15 → working date is Jan 14
 */
export declare function getWorkingDate(timestamp: Date, checkinEnd: string, timezone: string): string;
/**
 * Get working day boundaries (from checkin start to checkin end next day)
 * Example: For 2025-01-15, returns 2025-01-15 16:50 to 2025-01-16 02:00
 */
export declare function getWorkingDayBoundaries(workingDate: string, checkinStart: string, checkinEnd: string, timezone: string): {
    start: Date;
    end: Date;
};
/**
 * Check if samples indicate activity (mouse or keyboard)
 */
export declare function hasActivity(mouseDelta: number, keyCount: number): boolean;
/**
 * Determine if a span of samples represents idle time
 * @param samples - Array of samples with mouseDelta and keyCount
 * @param thresholdSeconds - Idle threshold in seconds
 * @returns true if all samples show no activity
 */
export declare function isIdleSpan(samples: Array<{
    mouseDelta: number;
    keyCount: number;
}>, thresholdSeconds?: number): boolean;
