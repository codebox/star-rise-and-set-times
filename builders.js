"use strict";

const buildersConstants = inBrowser ? {
    ARC_MINUTES_PER_DEGREE,
    ARC_SECONDS_PER_DEGREE
} : require('./constants');

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

const builders = Object.freeze({
    buildLocation() {
        const builder = {
            fromDegrees(latDegrees, lngDegrees) {
                return builder.fromRadians(degreesToRadians(latDegrees), degreesToRadians(lngDegrees));
            },
            fromRadians(latRadians, lngRadians) {
                assertInRange(latRadians, -Math.PI/2, Math.PI/2);
                assertInRange(lngRadians, -Math.PI, Math.PI);

                return Object.freeze({
                    radians : Object.freeze({
                        lat : latRadians,
                        lng : lngRadians
                    })
                });
            }
        };
        return builder;
    },

    buildClock() {
        return {
            withRealTime() {
                return Object.freeze({
                    millis() {
                        return Date.now();
                    }
                });
            },
            withFixedUTCTime(year, month, day, hour, minute, second) {
                assertInRange(year, 0, 9999);
                assertInRange(month, 1, 12);
                assertInRange(day, 1, 31);
                assertInRange(hour, 0, 23);
                assertInRange(minute, 0, 59);
                assertInRange(second, 0, 59);

                const millisSinceEpoch = Date.UTC(year, month - 1, day, hour, minute, second);

                return Object.freeze({
                    millis() {
                        return millisSinceEpoch;
                    }
                });
            }
        };
    },

    buildRightAscension() {
        const builder = {
            fromHour(hour) {
                assertInRange(hour, 0, 24);

                return Object.freeze({
                    radians : Math.PI * 2 * hour / 24
                });
            },
            fromHourMinSec(hours, minutes, seconds) {
                assertInRange(hours, 0, 23);
                assertInRange(minutes, 0, 59);
                assertInRange(seconds, 0, 59);

                return builder.fromHour(hours + minutes/60 + seconds/3600);
            }
        };
        return builder;
    },

    buildDeclination() {
        const builder = {
            fromDegrees(degrees) {
                assertInRange(degrees, -90, 90);

                return Object.freeze({
                    radians : degreesToRadians(degrees)
                });
            },
            fromDegreesMinSec(negative, degrees, arcMinutes, arcSeconds) {
                assertInRange(degrees, -90, 90);
                assertInRange(arcMinutes, 0, 60);
                assertInRange(arcSeconds, 0, 60);

                const absDegrees = Math.abs(degrees),
                    absArcMinutes = Math.abs(arcMinutes),
                    absArcSeconds = Math.abs(arcSeconds),
                    factor = (negative ? -1 : 1);

                return builder.fromDegrees(factor * (
                    absDegrees +
                    absArcMinutes / buildersConstants.ARC_MINUTES_PER_DEGREE +
                    absArcSeconds / buildersConstants.ARC_SECONDS_PER_DEGREE));
            }
        };
        return builder;
    }
});

exports.buildLocation = builders.buildLocation;
exports.buildClock = builders.buildClock;
exports.buildRightAscension = builders.buildRightAscension;
exports.buildDeclination = builders.buildDeclination;
