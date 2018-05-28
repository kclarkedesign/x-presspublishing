const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = require('./issues');


module.exports = seriesRouter;

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
	const query = 'SELECT * FROM Series WHERE Series.id = $seriesId';
	const values = { $seriesId: seriesId };
	db.get(query, values, (error, series) => {
		if(error) {
			next(error)
		} else if (series) {
			req.series = series;
			next();
		} else {
			res.sendStatus(404);
		}
	});
});

seriesRouter.get('/', (req, res, next) => {
	db.all('SELECT * FROM Series', (error, series) => {
		if (error) {
			next(error);
		} else {
			res.status(200).json({ series: series });
		}
	});
});

seriesRouter.post('/', (req, res, next) => {
	const series = req.body.series;
	const name = series.name;
	const description = series.description;
	if(!name || !description) {
		return res.sendStatus(400);
	}
	const query = 'INSERT INTO Series (name, description) VALUES ($name, $description)';
	const values = { 
		$name: name,
		$description: description
	};
	db.run(query, values, function(error) {
		if(error) {
			next(error);
		}
		db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (error, series) => {
			res.status(201).json({ series: series });
		});
	});
});

seriesRouter.get('/:seriesId', (req, res, next) => {
	res.status(200).json({ series: req.series });
});

seriesRouter.put('/:seriesId', (req, res, next) => {
	const series = req.body.series;
	const name = series.name;
	const description = series.description;
	if(!name || !description) {
		return res.sendStatus(400);
	} else {
		const query = 'UPDATE Series SET name = $name, description = $description WHERE Series.id = $seriesId';
		const values = { 
			$name: name,
			$description: description,
			$seriesId: req.params.seriesId
		};

		db.run(query, values, (error) => {
			if(error) {
				next(error);
			} else {
				db.get(`SELECT * FROM Series WHERE Series.id = ${values.$seriesId}`, (error, series) => {
					res.status(200).json({ series: series });
				});
			}
		});
	}
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
	const thisSeriesId = req.params.seriesId;
	db.get(`SELECT * FROM Issue WHERE Issue.series_id = ${thisSeriesId}`, (error, issues) => {
		if(error) {
			next(error);
		} else if (issues) {
			res.sendStatus(400);
		} else {
			db.run(`DELETE FROM Series WHERE Series.id = ${thisSeriesId}`, (error) => {
				if(error) {
					next(error);
				} else {
					res.sendStatus(204);
				}
			});
		}
	});
});
