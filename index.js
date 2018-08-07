const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

app.use(require('helmet')());

app.set('view engine', 'pug');
app.set('views', __dirname+'/views');
app.use(express.static(__dirname+'/public'));

const db = require('./db');
app.use((req, res, next) => {
	db.updateSpots()
		.then(next)
		.catch(next);
});
app.get('/', (req, res) => {
	db.getAllSpots()
		.then((result) => res.render('index'))
		.catch((err) => res.render('error'));
});

// endpoints for actions, returns 
app.get('/spot', (req, res) => {
	db.getAllSpots()
		.then((result) => res.send(result.rows))
		.catch((err) => res.sendStatus(500));
});

app.get('/spot/:id', (req, res) => {	
	db.getSpot(req.params.id)
		.then((result) => res.send(result.rows))
		.catch((err) => res.sendStatus(500));
});

app.use(require('body-parser').json({extended:true}));

app.put('/spot/:id/lock', (req, res) => {
	db.lockSpot(req.params.id, req.body.name)
		.then((result) => res.sendStatus(result.rowCount === 1 ? 200 : 500))
		.catch((err) => res.sendStatus(500));
});

app.put('/spot/:id/unlock', (req, res) => {
	db.unlockSpot(req.params.id, req.body.name)
		.then((result) => res.sendStatus(result.rowCount === 1 ? 200 : 500))
		.catch((err) => res.sendStatus(500));
});

app.listen(PORT);
console.log('listening on ' + PORT);
