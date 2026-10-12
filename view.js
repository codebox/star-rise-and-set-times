export const view = (() => {
	const form = document.getElementsByTagName('form')[0],
		submit = document.getElementById('calc'),
        reset = document.getElementById('reset'),
		location = document.getElementById('location'),
		inputs = form.querySelectorAll('input'),
		date = document.getElementById('date'),
		output = document.getElementById('output'),
		outputData = document.getElementById('outputData'),
		locationPresets = document.getElementById('locationPresets'),
		objectPresets = document.getElementById('objectPresets'),
		inputFields = {};

	let submitHandler;

	function buildOutputRow(labelText, otherText="") {
		return `<div class="row"><label>${labelText}</label><div>${otherText}</div></div>`;
	}
	function formatTime(time) {
		const utc = `${time.date.toISOString().slice(0, 10)} ${time.text} UTC`,
			local = time.date.toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'long'});
		return `${utc}<div class="local">${local} (your time)</div>`;
	}
	function showOutput(html) {
		output.hidden = false;
		outputData.innerHTML = html;
	}
	function todayText() {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	}
	function setFieldValue(fieldId, value) {
		if (value !== undefined) {
			inputFields[fieldId].value = value;
		}
	}

	const viewObject = {
		init() {
			inputs.forEach(el => inputFields[el.id] = el);
			date.value = todayText();

			submit.onclick = e => {
				e.preventDefault();
				if (!form.checkValidity()) {
					viewObject.error('Enter a value in every field, within the allowed range');
				} else if (submitHandler) {
					submitHandler(viewObject.getValues());
				}
			};

		    reset.onclick = () => {
		        viewObject.reset();
		    };
			location.onclick = e => {
				if (navigator.geolocation) {
		        	navigator.geolocation.getCurrentPosition(position => {
		        		inputFields.lat.value = position.coords.latitude;
		        		inputFields.lng.value = position.coords.longitude;
		        	}, error => {
		        		viewObject.error(`Unable to get your location: ${error.message}`);
		        	});
		    	} else {
		    		viewObject.error('Your browser cannot provide your location');
		    	}
			};
		},
		reset() {
			inputs.forEach(el => el.value = '');
			date.value = todayText();
			output.hidden = true;
			outputData.innerHTML = '';
		},
		getValues() {
			const values = {};
			inputs.forEach(el => values[el.id] = el.type === 'date' ? el.value : parseFloat(el.value));
			return values;
		},
		onSubmit(handler) {
			submitHandler = handler;			
		},
		addLocationPreset(name, lat, lng){
			const newPreset = document.createElement('li');

			newPreset.onclick = () => {
				setFieldValue('lat', lat);
				setFieldValue('lng', lng);
			};
			newPreset.innerHTML = name;
			locationPresets.appendChild(newPreset);
		},
		addObjectPreset(name, raH, raM, raS, decD, decM, decS){
			const newPreset = document.createElement('li');

			newPreset.onclick = () => {
				setFieldValue('raH', raH);
				setFieldValue('raM', raM);
				setFieldValue('raS', raS);

				setFieldValue('decD', decD);
				setFieldValue('decM', decM);
				setFieldValue('decS', decS);
			};
			newPreset.innerHTML = name;
			objectPresets.appendChild(newPreset);
		},
		neverRises() {
			showOutput(buildOutputRow('Never rises'));
		},
		neverSets() {
			showOutput(buildOutputRow('Never sets'));
		},
		risesAndSets(riseTime, setTime) {
			const events = [
				{label: 'Rises at:', time: riseTime},
				{label: 'Sets at:', time: setTime}
			].sort((a, b) => a.time.date - b.time.date);

			showOutput(events.map(event => buildOutputRow(event.label, formatTime(event.time))).join(''));
		},
		error(message) {
			showOutput(buildOutputRow('Error', message));
		}
	};

	return viewObject;
})();





