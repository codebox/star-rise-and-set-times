"use strict";

function buildCalculator() {
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

    function radiansToSiderealHours(radians) {
        if (radians < 0) {
            radians += RADIANS_PER_DAY;
        }
        return radians * 12 / Math.PI;
    }

    function zeroPad(num, len) {
        return num.toString().padStart(len, '0');
    }

    function calc(objectRightAscension, objectDeclination, userLocation, clock) {
        function radiansToClockTime(radians) {
            const siderealHours = radiansToSiderealHours(radians),
                clockTimeHours = (24 + (siderealHours - localSiderealHoursOffset)/CLOCK_HOURS_PER_SIDEREAL_HOUR) % 24,
                hours = Math.floor(clockTimeHours),
                minutes = Math.floor((clockTimeHours - hours) * MINUTES_PER_HOUR),
                seconds = Math.floor((clockTimeHours - hours - minutes / MINUTES_PER_HOUR) * SECONDS_PER_HOUR);

            return `${zeroPad(hours, 2)}:${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;
        }

        const ra = objectRightAscension.radians,
            dec = objectDeclination.radians,
            lat = userLocation.radians.lat,
            lng = userLocation.radians.lng,
            neverRises = Math.abs(dec - lat) >= Math.PI / 2,
            neverSets = Math.abs(dec + lat) >= Math.PI / 2,
            localSiderealHoursOffsetRadians = localSiderealTimeInRadians(clock, lng) - localClockTimeInRadians(clock),
            localSiderealHoursOffset = radiansToSiderealHours(localSiderealHoursOffsetRadians);

        let riseTime, setTime;

        if (!neverRises && !neverSets) {
            const c = Math.acos(-Math.tan(dec) * Math.tan(lat)),
                riseTimeRadians = ra - c,
                setTimeRadians = ra + c;

            riseTime = radiansToClockTime(riseTimeRadians);
            setTime = radiansToClockTime(setTimeRadians);
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