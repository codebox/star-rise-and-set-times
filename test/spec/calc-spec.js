import * as builders from '../../builders.js';
import {buildCalculator} from '../../calc.js';

describe("Star Rise/Set Time Calculator", () => {
    let location, clock, ra, dec;

    function calculate() {
        return buildCalculator().forLocation(location).withClock(clock).calculate(ra, dec);    
    }
    function atUTCTime(year, month, day, hour, minute, second) {
        clock = builders.buildClock().withFixedUTCTime(year, month, day, hour, minute, second);
    }
    function atLocation(lat, lng) {
        location = builders.buildLocation().fromDegrees(lat, lng);
    }
    function rightAscension(hours, minutes, seconds) {
        return builders.buildRightAscension().fromHourMinSec(hours, minutes, seconds);
    }
    function declination(degrees, minutes, seconds) {
        return builders.buildDeclination().fromDegreesMinSec(degrees < 0, Math.abs(degrees), minutes, seconds);
    }
    function theObjectWithCoordinates(raCoords, decCoords) {
        ra = raCoords;
        dec = decCoords;
    }
    function neverRises() {
        expect(calculate().neverRises).toBe(true);
        expect(calculate().neverSets).toBe(false);
        expect(calculate().riseTime).toBe(undefined);
        expect(calculate().setTime).toBe(undefined);
    }
    function neverSets() {
        expect(calculate().neverRises).toBe(false);
        expect(calculate().neverSets).toBe(true);
        expect(calculate().riseTime).toBe(undefined);
        expect(calculate().setTime).toBe(undefined);
    }
    function hasRiseAndSetTimes(riseTime, setTime) {
        expect(calculate().neverRises).toBe(false);
        expect(calculate().neverSets).toBe(false);
        expect(calculate().riseTime.text).toBe(riseTime);
        expect(calculate().setTime.text).toBe(setTime);
    }

    describe("At the North Pole", () => {
        beforeEach(() => {
            atLocation(90, 0);
            atUTCTime(2018, 1, 1, 0, 0, 0);
        });

        it("an object at the north celestial pole never sets", () => {
            theObjectWithCoordinates(rightAscension(0, 0, 0), declination(90, 0, 0));
            neverSets();
        });
        it("an object in the northern celestial hemisphere never sets", () => {
            theObjectWithCoordinates(rightAscension(12, 0, 0), declination(45, 0, 0));
            neverSets();
        });
        it("an object at the south celestial pole never rises", () => {
            theObjectWithCoordinates(rightAscension(0, 0, 0), declination(-90, 0, 0));
            neverRises();
        });
        it("an object in the southern celestial hemisphere never rises", () => {
            theObjectWithCoordinates(rightAscension(12, 0, 0), declination(-45, 0, 0));
            neverRises();
        });
        it("an object on the celestial equator never sets, because refraction lifts it above the horizon", () => {
            theObjectWithCoordinates(rightAscension(12, 0, 0), declination(0, 0, 0));
            neverSets();
        });
    });

    describe("At the South Pole", () => {
        beforeEach(() => {
            atLocation(-90, 0);
            atUTCTime(2018, 1, 1, 0, 0, 0);
        });

        it("an object at the north celestial pole never rises", () => {
            theObjectWithCoordinates(rightAscension(0, 0, 0), declination(90, 0, 0));
            neverRises();
        });
        it("an object in the northern celestial hemisphere never rises", () => {
            theObjectWithCoordinates(rightAscension(12, 0, 0), declination(45, 0, 0));
            neverRises();
        });
        it("an object at the south celestial pole never sets", () => {
            theObjectWithCoordinates(rightAscension(0, 0, 0), declination(-90, 0, 0));
            neverSets();
        });
        it("an object in the southern celestial hemisphere never sets", () => {
            theObjectWithCoordinates(rightAscension(12, 0, 0), declination(-45, 0, 0));
            neverSets();
        });
        it("an object on the celestial equator never sets, because refraction lifts it above the horizon", () => {
            theObjectWithCoordinates(rightAscension(12, 0, 0), declination(0, 0, 0));
            neverSets();
        });
    });

    describe("On the equator", () => {
        beforeEach(() => {
            atLocation(0, 0);
            atUTCTime(2018, 1, 1, 0, 0, 0);
        });

        it("an object at the north celestial pole never sets, because refraction lifts it above the horizon", () => {
            theObjectWithCoordinates(rightAscension(0, 0, 0), declination(90, 0, 0));
            neverSets();
        });
        it("an object at the south celestial pole never sets, because refraction lifts it above the horizon", () => {
            theObjectWithCoordinates(rightAscension(0, 0, 0), declination(-90, 0, 0));
            neverSets();
        });
    });

    describe("In Greenwich, UK", () => {
        beforeEach(() => {
            atLocation(51.476852, -0.000500);
        });

        describe("Sirius rise and set are correct", () => {
            beforeEach(() => {
                theObjectWithCoordinates(rightAscension(6, 45, 9), declination(-16, 42, 47));
            });

            it("on 1st January 2018", () => {
                atUTCTime(2018, 1, 1, 12, 0, 0);
                hasRiseAndSetTimes("19:25:01", "04:34:12");
            });

            it("on 1st June 2018", () => {
                atUTCTime(2018, 6, 1, 12, 0, 0);
                theObjectWithCoordinates(rightAscension(6, 45, 9), declination(-16, 42, 47));
                hasRiseAndSetTimes("09:27:24", "18:40:30");
            });
        });

        describe("Alpha Centauri never rises", () => {
            beforeEach(() => {
                theObjectWithCoordinates(rightAscension(14, 39, 36), declination(-60, 50, 2));
            });

            it("on 1st January 2018", () => {
                atUTCTime(2018, 1, 1, 12, 0, 0);
                neverRises();
            });

            it("on 1st June 2018", () => {
                atUTCTime(2018, 6, 1, 12, 0, 0);
                neverRises();
            });
        });

        describe("Fomalhaut rise and set are correct", () => {
            beforeEach(() => {
                theObjectWithCoordinates(rightAscension(22, 57, 39), declination(-29, 37, 20));
            });

            it("on 1st January 2018", () => {
                atUTCTime(2018, 1, 1, 12, 0, 0);
                hasRiseAndSetTimes("13:09:36", "19:17:32");
            });

            it("on 1st June 2018", () => {
                atUTCTime(2018, 6, 1, 12, 0, 0);
                hasRiseAndSetTimes("03:11:58", "09:19:56");
            });
        });
    });

    describe("Results are the next rise and set after the current time", () => {
        beforeEach(() => {
            atLocation(51.476852, -0.000500);
            theObjectWithCoordinates(rightAscension(6, 45, 9), declination(-16, 42, 47));
        });

        it("after the object has risen, the next rise is the following day", () => {
            atUTCTime(2018, 1, 1, 23, 0, 0);
            hasRiseAndSetTimes("19:21:05", "04:34:12");
            expect(calculate().riseTime.date.toISOString().slice(0, 10)).toBe("2018-01-02");
            expect(calculate().setTime.date.toISOString().slice(0, 10)).toBe("2018-01-02");
        });

        it("dates are returned with the times", () => {
            atUTCTime(2018, 1, 1, 12, 0, 0);
            expect(calculate().riseTime.date.toISOString().slice(0, 19)).toBe("2018-01-01T19:25:01");
            expect(calculate().setTime.date.toISOString().slice(0, 19)).toBe("2018-01-02T04:34:12");
        });

        it("times before 1970 are correct", () => {
            atUTCTime(1960, 1, 1, 12, 0, 0);
            hasRiseAndSetTimes("19:25:49", "04:35:43");
        });
    });

    describe("A fixed clock", () => {
        it("does not treat years 0-99 as 1900-1999", () => {
            atUTCTime(50, 3, 4, 5, 6, 7);
            expect(new Date(clock.millis()).getUTCFullYear()).toBe(50);
        });
    });

    describe("In Tromsø, Norway, where Sirius only just rises", () => {
        beforeEach(() => {
            atLocation(69.6492, 18.9553);
            theObjectWithCoordinates(rightAscension(6, 45, 9), declination(-16, 42, 47));
        });

        it("on 1st January 2026", () => {
            atUTCTime(2026, 1, 1, 12, 0, 0);
            hasRiseAndSetTimes("20:10:02", "01:18:10");
        });

        it("on 1st June 2026", () => {
            atUTCTime(2026, 6, 1, 12, 0, 0);
            hasRiseAndSetTimes("10:12:26", "15:24:28");
        });
    });

    describe("In Cerro Paranal, Chile", () => {
        beforeEach(() => {
            atLocation(-24.627222, -70.404167);
        });

        describe("Sirius rise and set are correct", () => {
            beforeEach(() => {
                theObjectWithCoordinates(rightAscension(6, 45, 9), declination(-16, 42, 47));
            });

            it("on 1st January 2018", () => {
                atUTCTime(2018, 1, 1, 12, 0, 0);
                hasRiseAndSetTimes("22:07:13", "11:13:42");
            });

            it("on 1st June 2018", () => {
                atUTCTime(2018, 6, 1, 12, 0, 0);
                theObjectWithCoordinates(rightAscension(6, 45, 9), declination(-16, 42, 47));
                hasRiseAndSetTimes("12:13:32", "01:20:01");
            });
        });

        describe("Alpha Centauri rise and set", () => {
            beforeEach(() => {
                theObjectWithCoordinates(rightAscension(14, 39, 36), declination(-60, 50, 2));
            });

            it("on 1st January 2018", () => {
                atUTCTime(2018, 1, 1, 12, 0, 0);
                hasRiseAndSetTimes("02:44:33", "22:27:46");
            });

            it("on 1st June 2018", () => {
                atUTCTime(2018, 6, 1, 12, 0, 0);
                hasRiseAndSetTimes("16:50:51", "12:34:07");
            });
        });

        describe("Fomalhaut rise and set are correct", () => {
            beforeEach(() => {
                theObjectWithCoordinates(rightAscension(22, 57, 39), declination(-29, 37, 20));
            });

            it("on 1st January 2018", () => {
                atUTCTime(2018, 1, 1, 12, 0, 0);
                hasRiseAndSetTimes("13:52:24", "03:56:25");
            });

            it("on 1st June 2018", () => {
                atUTCTime(2018, 6, 1, 12, 0, 0);
                hasRiseAndSetTimes("03:54:48", "18:02:44");
            });
        });
    });
});
