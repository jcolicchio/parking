// utilities for interacting with endpoints
const put = (url, body) => {
	return fetch(url, {
		method: 'put',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

const get = (url) => {
	return fetch(url, { method: 'get' });
}

const lockSpot = (id, name) => {
	return put('spot/'+id+'/lock', { name: name || '' });
};

const unlockSpot = (id, name) => {
	return put('spot/'+id+'/unlock', { name: name || '' });
};

const getAllSpots = () => {
	return get('spot')
		.then((result) => result.json());
};

// get data and populate body, or failing that, disable ui and schedule a retry
const refresh = () => {
	getAllSpots()
		.then((result) => update(result))
		.catch(reschedule);
}

var timeout = null;
const reschedule = () => {
	$('.spots').addClass('disabled');
	// disable body, set everything gray?
	if(!timeout) {
		timeout = setTimeout(() => {
			timeout = null;
			refresh();
		}, 1000);
	}
}

// update dom with data
const update = (data) => {
	const spot = (id, name) => {
		const spotClass = (name) => (name === null) ? 'empty' : 'taken';
		const pretty = (name) => {
			if(name === null) {
				return 'Empty';
			}
			else if(name === '') {
				return 'Someone';
			}
			return name;
		}
		return $('<div/>', {class:'spot '+spotClass(name)})
			.data('id', id)
			.data('name', name)
			.append(id+": "+pretty(name));
	}
	// remove all elements from body and repopulate with data
	var spots = $('.spots').empty().removeClass('disabled');
	// for each spot, create a div
	data.forEach((item) => spots.append(spot(item.id, item.name)).append('<br/>'));
};

var username = getCookies()["username"];

$(document).ready(() => {

	// set username if present in cookies
	if(username) {
		$('input').val(username).focus().blur();
	}

	// when hitting enter, blur input
	$('input').on('keyup', function(e) {
		if(e.keyCode == 13) {
			$(this).blur();
		}
	});

	// when blurring input, validate and save or discard
	$('input').on('focusout', function() {
		username = $(this).val();
		if(!username || !username.match(/^[0-9a-zA-Z]+$/)) {
			username = null;
			$(this).val("");
		}
		if(username) {
			setCookie('username', username);
		}
		else {
			deleteCookie('username');
		}
	});

	$('body').on('click', '.spots:not(.disabled) .taken', function() {
		var id = $(this).data("id");
		var name = $(this).data("name");
		if(name === '' && username) {
			lockSpot(id, username)
				.finally(refresh);
		}
		else if((username || '') === name) {
			unlockSpot(id, name)
				.finally(refresh);
		}
	});

	$('body').on('click', '.spots:not(.disabled) .empty', function() {
		var id = $(this).data("id");
		lockSpot(id, username || '')
			.finally(refresh);
	});

	refresh();
});
