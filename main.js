import * as builders from './builders.js';
import {buildCalculator} from './calc.js';
import {view} from './view.js';

view.init();

view.addLocationPreset('North Pole', 90, 0);
view.addLocationPreset('South Pole', -90, 0);
view.addLocationPreset('Greenwich', 51.4826, -0.0077);
view.addLocationPreset('Manchester', 53.4808, -2.2426);
view.addLocationPreset('New York', 40.7128, -74.0060);
view.addLocationPreset('Hong Kong', 22.3964, 114.1095);
view.addLocationPreset('Sydney', -33.8688, 151.2093);
view.addLocationPreset('Santiago', -33.4489, -70.6693);

// J2000 coordinates
view.addObjectPreset('Sirius',          6, 45,  8.92, -16, 42, 58.0);
view.addObjectPreset('Canopus',         6, 23, 57.11, -52, 41, 44.4);
view.addObjectPreset('Arcturus',       14, 15, 39.67,  19, 10, 56.7);
view.addObjectPreset('Alpha Centauri', 14, 39, 36.49, -60, 50,  2.4);
view.addObjectPreset('Vega',           18, 36, 56.34,  38, 47,  1.3);
view.addObjectPreset('Capella',         5, 16, 41.36,  45, 59, 52.8);
view.addObjectPreset('Rigel',           5, 14, 32.27,  -8, 12,  5.9);
view.addObjectPreset('Procyon',         7, 39, 18.12,   5, 13, 30.0);
view.addObjectPreset('Achernar',        1, 37, 42.85, -57, 14, 12.3);
view.addObjectPreset('Betelgeuse',      5, 55, 10.31,   7, 24, 25.4);
view.addObjectPreset('Polaris',         2, 31, 49.09,  89, 15, 50.8);

function clockForDate(dateText) {
	// dateText is 'YYYY-MM-DD' from the date input, a day in the viewer's time zone
	const [year, month, day] = dateText.split('-').map(Number),
		startOfDay = new Date(year, month - 1, day),
		now = new Date();

	if (startOfDay.toDateString() === now.toDateString()) {
		return builders.buildClock().withRealTime();
	}
	return builders.buildClock().withFixedUTCTime(startOfDay.getUTCFullYear(), startOfDay.getUTCMonth() + 1, startOfDay.getUTCDate(),
		startOfDay.getUTCHours(), startOfDay.getUTCMinutes(), startOfDay.getUTCSeconds());
}

view.onSubmit(values => {
	let result;
	try {
		const location = builders.buildLocation().fromDegrees(values.lat, values.lng),
		    clock = clockForDate(values.date),
		    ra = builders.buildRightAscension().fromHourMinSec(values.raH, values.raM, values.raS),
		    dec = builders.buildDeclination().fromDegreesMinSec(values.decD < 0 || Object.is(values.decD, -0), Math.abs(values.decD), values.decM, values.decS),
		    calculator = buildCalculator().forLocation(location).withClock(clock);

		result = calculator.calculate(ra, dec);
	} catch (e) {
		view.error('Please check the values you entered, one of them is out of range');
		return;
	}

	if (result.neverRises) {
		view.neverRises();
	} else if (result.neverSets) {
		view.neverSets();
	} else {
		view.risesAndSets(result.riseTime, result.setTime);
	}	
});
