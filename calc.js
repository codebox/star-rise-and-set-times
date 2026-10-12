import * as constants from './constants.js';

export function buildCalculator() {
    function zeroPad(num, len) {
        return num.toString().padStart(len, '0');
    }

    function precessFromJ2000(ra, dec, millisSinceEpoch) {
        // Catalogue coordinates are for the year 2000, but precession moves them by about 50 arcseconds a year.
        // Meeus, Astronomical Algorithms, ch. 21 (rigorous method)
        const t = (millisSinceEpoch - constants.EPOCH_MILLIS_AT_2000_01_01_12_00_00) / constants.MILLISECONDS_PER_DAY / constants.DAYS_PER_JULIAN_CENTURY,
            zeta = (2306.2181 * t + 0.30188 * t * t + 0.017998 * t * t * t) * constants.RADIANS_PER_ARC_SECOND,
            z = (2306.2181 * t + 1.09468 * t * t + 0.018203 * t * t * t) * constants.RADIANS_PER_ARC_SECOND,
            theta = (2004.3109 * t - 0.42665 * t * t - 0.041833 * t * t * t) * constants.RADIANS_PER_ARC_SECOND,
            a = Math.cos(dec) * Math.sin(ra + zeta),
            b = Math.cos(theta) * Math.cos(dec) * Math.cos(ra + zeta) - Math.sin(theta) * Math.sin(dec),
            c = Math.sin(theta) * Math.cos(dec) * Math.cos(ra + zeta) + Math.cos(theta) * Math.sin(dec);

        return {
            ra: Math.atan2(a, b) + z,
            dec: Math.asin(c)
        };
    }

    function calc(objectRightAscension, objectDeclination, userLocation, clock) {
        function millisToClockTime(millisSinceEpoch) {
            // the modulo must stay positive for times before 1970
            const millisSinceStartOfDay = ((millisSinceEpoch % constants.MILLISECONDS_PER_DAY) + constants.MILLISECONDS_PER_DAY) % constants.MILLISECONDS_PER_DAY,
                secondsSinceStartOfDay = Math.floor(millisSinceStartOfDay / constants.MILLISECONDS_PER_SECOND),
                hours = Math.floor(secondsSinceStartOfDay / constants.SECONDS_PER_HOUR),
                minutes = Math.floor((secondsSinceStartOfDay % constants.SECONDS_PER_HOUR) / constants.SECONDS_PER_MINUTE),
                seconds = secondsSinceStartOfDay % constants.SECONDS_PER_MINUTE;

            return {
                text:`${zeroPad(hours, 2)}:${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`,
                date: new Date(millisSinceEpoch),
                hours, minutes, seconds
            };
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
            // the first time at or after the clock's current time that the local sidereal time equals 'radians'.
            // This uses mean sidereal time, the apparent sidereal time differs from it by about a second at most.
            const daysSince_2000_01_01_12 = (clock.millis() - constants.EPOCH_MILLIS_AT_2000_01_01_12_00_00) / constants.MILLISECONDS_PER_DAY,
                localSiderealTimeAt_2000_01_01_12 = constants.GMST_HOURS_AT_2000_01_01_12 * constants.RADIANS_PER_HOUR + userLocation.radians.lng,
                siderealRadiansPerDay = constants.GMST_HOURS_PER_DAY * constants.RADIANS_PER_HOUR,
                days = unmod(radians, localSiderealTimeAt_2000_01_01_12, siderealRadiansPerDay, 2 * Math.PI,
                    daysSince_2000_01_01_12, daysSince_2000_01_01_12 + 1)[0],
                millisSinceEpoch = days * constants.MILLISECONDS_PER_DAY + constants.EPOCH_MILLIS_AT_2000_01_01_12_00_00;
            return millisToClockTime(millisSinceEpoch);
        }

        const {ra, dec} = precessFromJ2000(objectRightAscension.radians, objectDeclination.radians, clock.millis()),
            lat = userLocation.radians.lat,
            h0 = constants.ALTITUDE_AT_RISE_AND_SET_RADIANS,
            // the cosine of the hour angle at which the object is at altitude h0
            cosHourAngle = (Math.sin(h0) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec)),
            neverRises = cosHourAngle > 1,
            neverSets = cosHourAngle < -1;

        let riseTime, setTime;

        if (!neverRises && !neverSets) {
            const c = Math.acos(cosHourAngle),
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
