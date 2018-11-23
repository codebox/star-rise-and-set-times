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
});
