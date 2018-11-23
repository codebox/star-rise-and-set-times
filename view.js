"use strict";

const view = (() => {
	const form = document.getElementsByTagName('form')[0],
		submit = document.getElementById('calc'),
        reset = document.getElementById('reset'),
		location = document.getElementById('location'),
		inputs = form.querySelectorAll('input'),
		output = document.getElementById('output'),
		locationPresets = document.getElementById('locationPresets'),
		objectPresets = document.getElementById('objectPresets'),
		inputFields = {};

	let submitHandler;

	function buildOutputRow(labelText, otherText="") {
		return `<div class="row"><label>${labelText}</label><div>${otherText}</div></div>`;
	}
	function setFieldValue(fieldId, value) {
		if (value !== undefined) {
			inputFields[fieldId].value = value;
		}
	}

	const viewObject = {
		init() {
			inputs.forEach(el => inputFields[el.id] = el);

			submit.onclick = e => {
				e.preventDefault();
				if (form.checkValidity() && submitHandler) {
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
		        	});
		    	} 
			};
		},
		reset() {
			inputs.forEach(el => el.value = '');
			output.innerHTML = '';
		},
		getValues() {
			const values = {};
			inputs.forEach(el => values[el.id] = parseFloat(el.value));
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
			output.innerHTML = buildOutputRow('Never rises');
		},
		neverSets() {
			output.innerHTML = buildOutputRow('Never sets');
		},
		risesAndSets(riseTime, setTime) {
			output.innerHTML = buildOutputRow('Rises at:', riseTime) + buildOutputRow('Sets at:', setTime);
		}
	};

	return viewObject;
})();





