"use strict";

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
    function neverRisesOrSets() {
        expect(calculate().neverRises).toBe(true);
        expect(calculate().neverSets).toBe(true);
        expect(calculate().riseTime).toBe(undefined);
        expect(calculate().setTime).toBe(undefined);
    }
    function hasRiseAndSetTimes(riseTime, setTime) {
        expect(calculate().neverRises).toBe(false);
        expect(calculate().neverSets).toBe(false);
        expect(calculate().riseTime).toBe(riseTime);
        expect(calculate().setTime).toBe(setTime);
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
        it("an object on the celestial equator never rises or sets", () => {
            theObjectWithCoordinates(rightAscension(12, 0, 0), declination(0, 0, 0));
            neverRisesOrSets();
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
        it("an object on the celestial equator never rises or sets", () => {
            theObjectWithCoordinates(rightAscension(12, 0, 0), declination(0, 0, 0));
            neverRisesOrSets();
        });
    });

    describe("On the equator", () => {
        beforeEach(() => {
            atLocation(0, 0);
            atUTCTime(2018, 1, 1, 0, 0, 0);
        });

        it("an object at the north celestial pole never rises or sets", () => {
            theObjectWithCoordinates(rightAscension(0, 0, 0), declination(90, 0, 0));
            neverRisesOrSets();
        });
        it("an object at the south celestial pole never rises or sets", () => {
            theObjectWithCoordinates(rightAscension(0, 0, 0), declination(-90, 0, 0));
            neverRisesOrSets();
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
                hasRiseAndSetTimes("19:28:11", "04:29:26");
            });

            it("on 1st June 2018", () => {
                atUTCTime(2018, 6, 1, 12, 0, 0);
                theObjectWithCoordinates(rightAscension(6, 45, 9), declination(-16, 42, 47));
                hasRiseAndSetTimes("09:30:33", "18:35:44");
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
                hasRiseAndSetTimes("13:15:23", "19:09:47");
            });

            it("on 1st June 2018", () => {
                atUTCTime(2018, 6, 1, 12, 0, 0);
                hasRiseAndSetTimes("03:17:45", "09:12:09");
            });
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
                hasRiseAndSetTimes("22:09:05", "11:10:14");
            });

            it("on 1st June 2018", () => {
                atUTCTime(2018, 6, 1, 12, 0, 0);
                theObjectWithCoordinates(rightAscension(6, 45, 9), declination(-16, 42, 47));
                hasRiseAndSetTimes("12:15:22", "01:16:31");
            });
        });

        describe("Alpha Centauri rise and set", () => {
            beforeEach(() => {
                theObjectWithCoordinates(rightAscension(14, 39, 36), declination(-60, 50, 2));
            });

            it("on 1st January 2018", () => {
                atUTCTime(2018, 1, 1, 12, 0, 0);
                hasRiseAndSetTimes("02:53:30", "22:16:03");
            });

            it("on 1st June 2018", () => {
                atUTCTime(2018, 6, 1, 12, 0, 0);
                hasRiseAndSetTimes("16:59:48", "12:22:20");
            });
        });

        describe("Fomalhaut rise and set are correct", () => {
            beforeEach(() => {
                theObjectWithCoordinates(rightAscension(22, 57, 39), declination(-29, 37, 20));
            });

            it("on 1st January 2018", () => {
                atUTCTime(2018, 1, 1, 12, 0, 0);
                hasRiseAndSetTimes("13:54:09", "03:52:43");
            });

            it("on 1st June 2018", () => {
                atUTCTime(2018, 6, 1, 12, 0, 0);
                hasRiseAndSetTimes("03:56:30", "17:59:01");
            });
        });
    });
});
