'use strict';

const pg = require('pg');

const pool = new pg.Pool({
	host: process.env.DATABASE_HOST || 'localhost',
	database: process.env.DATABASE_DB || 'exdb',
	user: process.env.DATABASE_USER || 'exuser',
});

const getAllSpots = () => {
	return pool.query('SELECT id, name FROM parking ORDER BY id');
};

const getSpot = (id) => {
	return pool.query('SELECT id, name FROM parking WHERE id = $1::text ORDER BY id', [id]);
};

const validate = (name) => {
	return (name == '' || (name && name.match(/^[0-9a-zA-Z]*$/)));
};

// todo: validation? value must not be null, otherwise we'd be locking it to unlock it
const lockSpot = (id, name) => {
	if(!validate(name)) {
		throw new Error('bad name: ' + name);
	}
	return pool.query('UPDATE parking SET name = $1::text WHERE id = $2::text AND (name IS NULL OR name = \'\')', [name, id]);
};

const unlockSpot = (id, name) => {
	if(!validate(name)) {
		throw new Error('bad name: ' + name);
	}
	return pool.query('UPDATE parking SET name = NULL WHERE id = $1::text AND name = $2::text', [id, name]);
};

const updateSpots = () => {
	return pool.query("SELECT day FROM parking_date WHERE to_char(day, 'yyyymmdd') = to_char(NOW(), 'yyyymmdd')")
		.then(result => {
		if(result.rowCount === 0) {
			return pool.query("INSERT INTO parking_date VALUES (NOW())")
				.then(() => pool.query("UPDATE parking SET name = NULL"));
		}
	});
};

module.exports = {
	getAllSpots: getAllSpots,
	getSpot: getSpot,
	lockSpot:lockSpot,
	unlockSpot:unlockSpot,
	updateSpots: updateSpots
};
