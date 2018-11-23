"use strict";

function assert(val, msg) {
    if (!val) {
        throw Error(msg || 'Assertion failure');
    }
}

function assertInRange(val, min, max) {
    assert(val >= min && val <= max, `Expected value ${val} to be in range ${min} -> ${max}`)
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function radiansToSiderealHours(radians) {
    if (radians < 0) {
        radians += RADIANS_PER_DAY;
    }
    return radians * 12 / Math.PI;
}

const ARC_MINUTES_PER_DEGREE = 60,
    ARC_SECONDS_PER_ARC_MINUTE = 60,
    ARC_SECONDS_PER_DEGREE = ARC_MINUTES_PER_DEGREE * ARC_SECONDS_PER_ARC_MINUTE,
    MILLISECONDS_PER_SECOND = 1000,
    RADIANS_PER_DAY = Math.PI * 2,
    SECONDS_PER_MINUTE = 60,
    MINUTES_PER_HOUR = 60,
    SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR,
    HOURS_PER_DAY = 24,
    MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY,
    SECONDS_PER_DAY = SECONDS_PER_MINUTE * MINUTES_PER_DAY,
    MILLISECONDS_PER_DAY = SECONDS_PER_DAY * MILLISECONDS_PER_SECOND,
    EPOCH_MILLIS_AT_2000_01_01_12_00_00 = 946728000000,
    CLOCK_HOURS_PER_SIDEREAL_HOUR = 1 + 1 / (365 + 5 / HOURS_PER_DAY + 48 / MINUTES_PER_DAY + 46 / SECONDS_PER_DAY)

;

function localClockTimeInRadians(clock) {
    const previousMidnight = new Date(clock.millis());
    previousMidnight.setMilliseconds(0);
    previousMidnight.setSeconds(0);
    previousMidnight.setMinutes(0);
    previousMidnight.setHours(0);

    const previousMidnightMillis = previousMidnight.getTime(),
        secondsSinceMidnight = (clock.millis() - previousMidnightMillis) / MILLISECONDS_PER_SECOND;

    return RADIANS_PER_DAY * secondsSinceMidnight / SECONDS_PER_DAY;
}

function localSiderealTimeInRadians(clock, lngRadians) {
    const daysSince2000 = (clock.millis() - EPOCH_MILLIS_AT_2000_01_01_12_00_00) / MILLISECONDS_PER_DAY

    return (4.894961212735792 + 6.30038809898489 * daysSince2000 + lngRadians) % RADIANS_PER_DAY;
}

function zeroPad(num, len) {
    return num.toString().padStart(len, '0');
}