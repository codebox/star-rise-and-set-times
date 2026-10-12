import * as builders from './builders.js';
import {buildCalculator} from './calc.js';
import {view} from './view.js';

view.init();

view.addLocationPreset('North Pole', 90, 0);
view.addLocationPreset('South Pole', -90, 0);
view.addLocationPreset('Manchester', 53.4808, -2.2426);

view.addObjectPreset('Sirius', 6, 45, 8.92, -16, 42, 58.0);
view.addObjectPreset('Polaris', 2, 31, 49.09, 89, 15, 50.8);
view.addObjectPreset('Alpha Centauri', 14, 39, 36.49, -60, 50, 2.4);

function dateAndTime(time) {
	return `${time.date.toISOString().slice(0, 10)} ${time.text}`;
}

view.onSubmit(values => {
	let result;
	try {
		const location = builders.buildLocation().fromDegrees(values.lat, values.lng),
		    clock = builders.buildClock().withRealTime(),
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
		view.risesAndSets(dateAndTime(result.riseTime), dateAndTime(result.setTime));
	}	
});
