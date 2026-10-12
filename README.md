# star-rise-and-set-times

Here is a browser-based tool for calculating the rising and setting times of stars. You can [try it online here](https://codebox.net/pages/star-rise-and-set-time-calculator).

<img alt="star rise and set calculator screenshot" src="./screenshot.png" width="600">

The code is based on formulae [from](https://idlastro.gsfc.nasa.gov/ftp/pro/astro/hadec2altaz.pro) [various](http://aa.usno.navy.mil/faq/docs/GAST.php) [sources](https://astronomy.stackexchange.com/a/14508/24882) with much credit to [Barry Carter](http://wordpress.barrycarter.info) for his help and patience.

Enter the object's coordinates for the year 2000 (J2000), as given by most star catalogues. The calculation then:

- corrects the coordinates for precession between 2000 and today, which moves them by about 50 arcseconds a year
- uses the standard value for atmospheric refraction at the horizon (34 arcminutes), so the times are when the object appears to rise and set, not when it crosses the geometric horizon

It ignores nutation, aberration and, for most stars, their own motion across the sky, which usually change the times by no more than a few seconds. The bigger uncertainty is the atmosphere itself: real refraction varies with temperature and pressure, and hills, buildings or your height above sea level change where the horizon is. Expect the times to be within a minute or so at mid-latitudes, and less accurate near the poles or for objects that only just rise, which cross the horizon at a shallow angle.

The expected values in [the tests](test/spec/calc-spec.js) have been checked against a separate calculation that finds when the object's altitude crosses -34 arcminutes by searching through the day.

## Running it locally

The page uses JavaScript modules, which browsers won't load from `file://` URLs, so serve the folder over HTTP, for example with `python3 -m http.server`, and open `http://localhost:8000/`.

## Using it as a library

```js
import {buildCalculator, buildClock, buildLocation, buildRightAscension, buildDeclination} from 'star-rise-and-set-times';

const result = buildCalculator()
    .forLocation(buildLocation().fromDegrees(51.4769, -0.0005))
    .withClock(buildClock().withRealTime())
    .calculate(buildRightAscension().fromHourMinSec(6, 45, 9), buildDeclination().fromDegreesMinSec(true, 16, 42, 58));
```

`result` has `neverRises` and `neverSets` flags, and, when the object does rise and set, `riseTime` and `setTime`. These are the next rise and set after the clock's time, each with a `date` (a JavaScript `Date`) and the UTC time of day as `text`, `hours`, `minutes` and `seconds`.

## Tests

```
npm install
npm test
```
