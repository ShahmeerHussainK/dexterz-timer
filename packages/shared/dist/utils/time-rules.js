"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWithinCheckinWindow = isWithinCheckinWindow;
exports.isWithinBreakWindow = isWithinBreakWindow;
exports.getCurrentTimeInTz = getCurrentTimeInTz;
exports.localTimeToUtc = localTimeToUtc;
exports.formatInTz = formatInTz;
exports.getDayBoundariesInTz = getDayBoundariesInTz;
exports.getWorkingDate = getWorkingDate;
exports.getWorkingDayBoundaries = getWorkingDayBoundaries;
exports.hasActivity = hasActivity;
exports.isIdleSpan = isIdleSpan;
const date_fns_tz_1 = require("date-fns-tz");
const date_fns_1 = require("date-fns");
/**
 * Check if a timestamp falls within the check-in window
 * Handles midnight crossing (e.g., 16:50 -> 02:00 next day)
 */
function isWithinCheckinWindow(timestamp, rules) {
    const tz = rules.timezone;
    const zonedTime = (0, date_fns_tz_1.utcToZonedTime)(timestamp, tz);
    const timeStr = (0, date_fns_tz_1.format)(zonedTime, 'HH:mm', { timeZone: tz });
    const { start, end } = rules.checkinWindow;
    // If end < start, window crosses midnight
    if (end < start) {
        return timeStr >= start || timeStr < end;
    }
    return timeStr >= start && timeStr < end;
}
/**
 * Check if a timestamp falls within the break window
 */
function isWithinBreakWindow(timestamp, rules) {
    const tz = rules.timezone;
    const zonedTime = (0, date_fns_tz_1.utcToZonedTime)(timestamp, tz);
    const timeStr = (0, date_fns_tz_1.format)(zonedTime, 'HH:mm', { timeZone: tz });
    const { start, end } = rules.breakWindow;
    // Break window typically doesn't cross midnight, but handle it anyway
    if (end < start) {
        return timeStr >= start || timeStr < end;
    }
    return timeStr >= start && timeStr < end;
}
/**
 * Get the current time in the organization's timezone
 */
function getCurrentTimeInTz(timezone) {
    return (0, date_fns_tz_1.utcToZonedTime)(new Date(), timezone);
}
/**
 * Convert a local time string to UTC
 */
function localTimeToUtc(dateStr, timeStr, timezone) {
    const localDateTime = (0, date_fns_1.parse)(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
    return (0, date_fns_tz_1.zonedTimeToUtc)(localDateTime, timezone);
}
/**
 * Format a date in the organization's timezone
 */
function formatInTz(date, formatStr, timezone) {
    return (0, date_fns_tz_1.format)((0, date_fns_tz_1.utcToZonedTime)(date, timezone), formatStr, { timeZone: timezone });
}
/**
 * Get the start and end of a day in the organization's timezone
 */
function getDayBoundariesInTz(date, timezone) {
    const zonedDate = (0, date_fns_tz_1.utcToZonedTime)(date, timezone);
    const dayStart = (0, date_fns_1.startOfDay)(zonedDate);
    const dayEnd = (0, date_fns_1.addDays)(dayStart, 1);
    return {
        start: (0, date_fns_tz_1.zonedTimeToUtc)(dayStart, timezone),
        end: (0, date_fns_tz_1.zonedTimeToUtc)(dayEnd, timezone),
    };
}
/**
 * Get the working date for a timestamp based on check-in window
 * If time is before checkin end (e.g., 02:00), it belongs to previous day's shift
 * Example: 01:30 AM on Jan 15 → working date is Jan 14
 */
function getWorkingDate(timestamp, checkinEnd, timezone) {
    const zonedTime = (0, date_fns_tz_1.utcToZonedTime)(timestamp, timezone);
    const timeStr = (0, date_fns_tz_1.format)(zonedTime, 'HH:mm', { timeZone: timezone });
    // If current time is before checkin end (e.g., before 02:00), subtract one day
    if (timeStr < checkinEnd) {
        const previousDay = (0, date_fns_1.addDays)(zonedTime, -1);
        return (0, date_fns_tz_1.format)(previousDay, 'yyyy-MM-dd', { timeZone: timezone });
    }
    return (0, date_fns_tz_1.format)(zonedTime, 'yyyy-MM-dd', { timeZone: timezone });
}
/**
 * Get working day boundaries (from checkin start to checkin end next day)
 * Example: For 2025-01-15, returns 2025-01-15 16:50 to 2025-01-16 02:00
 */
function getWorkingDayBoundaries(workingDate, checkinStart, checkinEnd, timezone) {
    // Start: workingDate at checkinStart time
    const startStr = `${workingDate} ${checkinStart}`;
    const start = (0, date_fns_tz_1.zonedTimeToUtc)(startStr, timezone);
    // End: next day at checkinEnd time
    const nextDay = (0, date_fns_tz_1.format)((0, date_fns_1.addDays)((0, date_fns_1.parse)(workingDate, 'yyyy-MM-dd', new Date()), 1), 'yyyy-MM-dd');
    const endStr = `${nextDay} ${checkinEnd}`;
    const end = (0, date_fns_tz_1.zonedTimeToUtc)(endStr, timezone);
    return { start, end };
}
/**
 * Check if samples indicate activity (mouse or keyboard)
 */
function hasActivity(mouseDelta, keyCount) {
    return mouseDelta > 0 || keyCount > 0;
}
/**
 * Determine if a span of samples represents idle time
 * @param samples - Array of samples with mouseDelta and keyCount
 * @param thresholdSeconds - Idle threshold in seconds
 * @returns true if all samples show no activity
 */
function isIdleSpan(samples, thresholdSeconds = 300) {
    if (samples.length === 0)
        return false;
    return samples.every(s => !hasActivity(s.mouseDelta, s.keyCount));
}
