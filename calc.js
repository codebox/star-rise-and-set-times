"use strict";

const constants = inBrowser ? {
    MILLISECONDS_PER_SECOND,
    RADIANS_PER_DAY,
    SECONDS_PER_DAY,
    MINUTES_PER_HOUR,
    SECONDS_PER_HOUR,
    EPOCH_MILLIS_AT_2000_01_01_12_00_00,
    MILLISECONDS_PER_DAY
} : require('./constants');

function buildCalculator() {
    function localClockTimeInRadians(clock) {
        const previousMidnight = new Date(clock.millis());
        previousMidnight.setMilliseconds(0);
        previousMidnight.setSeconds(0);
        previousMidnight.setMinutes(0);
        previousMidnight.setHours(0);

        const previousMidnightMillis = previousMidnight.getTime(),
            secondsSinceMidnight = (clock.millis() - previousMidnightMillis) / constants.MILLISECONDS_PER_SECOND;

        return constants.RADIANS_PER_DAY * secondsSinceMidnight / constants.SECONDS_PER_DAY;
    }

    function zeroPad(num, len) {
        return num.toString().padStart(len, '0');
    }

    function calc(objectRightAscension, objectDeclination, userLocation, clock) {
        function hoursToClockTime(timeInHours) {
            const hours = Math.floor(timeInHours),
                minutes = Math.floor((timeInHours - hours) * constants.MINUTES_PER_HOUR),
                seconds = Math.floor((timeInHours - hours - minutes / constants.MINUTES_PER_HOUR) * constants.SECONDS_PER_HOUR);

            return `${zeroPad(hours, 2)}:${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;
        }

        function unmod(r, a, b, m, x_0, x_1) {
            // find all 'n' such that x_0 <= (n * m + r - a) / b <= x_1
            const from_n = Math.ceil((x_0 * b + a - r) / m),
                to_n = Math.floor((x_1 * b + a - r) / m);
            const x_values = []
            for (let n = from_n; n <= to_n; n++) {
                x_values.push((n * m + r - a) / b);
            }
            return x_values;
        }

        function radiansToUtcTime(radians) {
            const daysSince_2000_01_01_12 = (clock.millis() - constants.EPOCH_MILLIS_AT_2000_01_01_12_00_00) / constants.MILLISECONDS_PER_DAY,
                prevMidDay = Math.floor(daysSince_2000_01_01_12),
                // https://aa.usno.navy.mil/faq/docs/GAST.php
                days = unmod(radians, 4.894961212735792 + userLocation.radians.lng, 6.30038809898489, 2 * Math.PI,
                    prevMidDay, prevMidDay + 1)[0],
                millisSinceEpoch = days * constants.MILLISECONDS_PER_DAY + constants.EPOCH_MILLIS_AT_2000_01_01_12_00_00,
                millisSinceStartOfDay = millisSinceEpoch % constants.MILLISECONDS_PER_DAY,
                hoursSinceStartOfDay = millisSinceStartOfDay / (constants.MILLISECONDS_PER_SECOND * constants.SECONDS_PER_HOUR);
            return hoursToClockTime(hoursSinceStartOfDay);
        }

        const ra = objectRightAscension.radians,
            dec = objectDeclination.radians,
            lat = userLocation.radians.lat,
            lng = userLocation.radians.lng,
            neverRises = Math.abs(dec - lat) >= Math.PI / 2,
            neverSets = Math.abs(dec + lat) >= Math.PI / 2;

        let riseTime, setTime;

        if (!neverRises && !neverSets) {
            const c = Math.acos(-Math.tan(dec) * Math.tan(lat)),
                riseTimeRadians = ra - c,
                setTimeRadians = ra + c;

            riseTime = radiansToUtcTime(riseTimeRadians);
            setTime = radiansToUtcTime(setTimeRadians);
        }

        return {
            neverRises,
            neverSets,
            riseTime,
            setTime
        };
    }

    return Object.freeze({
        forLocation(userLocation) {
            return Object.freeze({
                withClock(clock) {
                    return {
                        calculate(objectRightAscension, objectDeclination) {
                            return calc(objectRightAscension, objectDeclination, userLocation, clock);
                        }
                    };
                }
            });
        }
    });
}

exports.buildCalculator = buildCalculator;