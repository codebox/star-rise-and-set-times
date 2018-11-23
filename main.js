"use strict";

view.init();

view.addLocationPreset('North Pole', 90, 0);
view.addLocationPreset('South Pole', -90, 0);
view.addLocationPreset('Manchester', 53.4808, 2.2426);

view.addObjectPreset('Sirius', 6, 45, 9, -16, 42, 58);
view.addObjectPreset('Polaris', 2, 31, 49, 89, 15, 38);
view.addObjectPreset('Alpha Centauri', 14, 39, 36, -60, 50, 2);

view.onSubmit(values => {
	const location = builders.buildLocation().fromDegrees(values.lat, values.lng),
	    clock = builders.buildClock().withRealTime(),
	    ra = builders.buildRightAscension().fromHourMinSec(values.raH, values.raM, values.raS),
	    dec = builders.buildDeclination().fromDegreesMinSec(values.decD < 0, Math.abs(values.decD), values.decM, values.decS),
	    calculator = buildCalculator().forLocation(location).withClock(clock);

	const result = calculator.calculate(ra, dec);
	
	if (result.neverRises) {
		view.neverRises();
	} else if (result.neverSets) {
		view.neverSets();
	} else {
		view.risesAndSets(result.riseTime, result.setTime);
	}	
});
