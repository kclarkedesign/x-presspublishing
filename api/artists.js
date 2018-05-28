const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = artistsRouter;

artistsRouter.get('/', (req, res, next) => {
	db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1', (err, artists) => {
		if(err) {
			next(err);
		} else {
			res.status(200).json({artists: artists});
		}
	});
});

artistsRouter.post('/', (req, res, next) => {
	const artist = req.body.artist;
	const name = artist.name;
	const dateOfBirth = artist.dateOfBirth;
	const biography = artist.biography;
	const isCurrentlyEmployed = artist.isCurrentlyEmployed === 0 ? 0 : 1;
	
	if(!name || !dateOfBirth || !biography) {
		return res.sendStatus(400);
	}

	const query = `INSERT INTO Artist (
			name,
			date_of_birth,
			biography,
			is_currently_employed)
		VALUES (
			$name, 
			$dateOfBirth,
			$biography,
			$isCurrentlyEmployed)`;
	const values = {
		$name: name,
		$dateOfBirth: dateOfBirth,
		$biography: biography,
		$isCurrentlyEmployed: isCurrentlyEmployed
	} 

	db.run(query, values, function(error) {
		if(error) {
			next(error);
		}
		db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, function(error, artist) {
			res.status(201).json({ artist: artist });
		})
	});

});

artistsRouter.param('artistId', (req, res, next, artistId) => {
	const query = 'SELECT * FROM Artist WHERE Artist.id = $artistId'
	const values = { $artistId: artistId };
	db.get(query, values, (error, artist) => {
		if (error) {
			next(error)
		} else if (artist) {
			req.artist = artist;
			next();
		} else {
			res.sendStatus(404);
		}
	});
});

artistsRouter.get('/:artistId', (req, res, next) => {
	res.status(200).json({ artist: req.artist });
});

artistsRouter.put('/:artistId', (req, res, next) => {
	const artist = req.body.artist;
	const name = artist.name;
	const dateOfBirth = artist.dateOfBirth;
	const biography = artist.biography;
	const isCurrentlyEmployed = artist.isCurrentlyEmployed === 0 ? 0 : 1;
	if(!artist || !name || !dateOfBirth || !biography) {
		res.sendStatus(400);
	} else {
		const query = `UPDATE Artist 
			SET name = $name, 
				date_of_birth = $dateOfBirth, 
				biography = $biography, 
				is_currently_employed = $isCurrentlyEmployed 
			WHERE Artist.id = $artistId`;
		const values = {
			$name: name,
			$dateOfBirth: dateOfBirth,
			$biography: biography,
			$isCurrentlyEmployed: isCurrentlyEmployed,
			$artistId: req.params.artistId
		};

		db.run(query, values, (error) => {
			if(error) {
				next(error);
			} else {
				db.get(`SELECT * FROM Artist WHERE Artist.id = ${values.$artistId}`, (error, artist) => {
					res.status(200).json({ artist: artist });
				});
			}
		});
	}
});

artistsRouter.delete('/:artistId', (req, res, next) => {
	const thisArtistId = req.params.artistId;
	db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = ${thisArtistId}`, (error) => {
		if(error) {
			next(error);
		} else {
			db.get(`SELECT * FROM Artist WHERE Artist.id = ${thisArtistId}`, (error, artist) => {
				res.status(200).json({ artist: artist });
			});
		}
	})
});