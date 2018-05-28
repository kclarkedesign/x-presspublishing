const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = issuesRouter;

issuesRouter.param('issueId', (req, res, next, issueId) => {
	const query = 'SELECT * FROM Issue WHERE Issue.id = $issueId';
	const values = { $issueId: issueId };
	db.get(query, values, (error, issue) => {
		if(error) {
			next(error)
		} else if (issue) {
			req.issue = issue;
			next();
		} else {
			res.sendStatus(404);
		}
	});
});

issuesRouter.get('/', (req, res, next) => {
	db.all(`SELECT * FROM Issue WHERE Issue.series_id = ${req.params.seriesId}`, (error, issues) => {
		if (error) {
			next(error);
		} else {
			res.status(200).json({ issues: issues });
		}
	});
});

issuesRouter.post('/', (req, res, next) => {
	const issue = req.body.issue;
	const name = issue.name;
	const issueNumber = issue.issueNumber;
	const publicationDate = issue.publicationDate;
	const artistId = issue.artistId;
	db.get(`SELECT * FROM Artist WHERE Artist.id = ${artistId}`, (error) => {
		if(error) {
			next(error);
		} else {
			if(!name || !issueNumber || !publicationDate || !artistId) {
				return res.sendStatus(400);
			} else {
				const query = 'INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)';
				const values = { 
					$name: name,
					$issueNumber: issueNumber,
					$publicationDate: publicationDate,
					$artistId: artistId,
					$seriesId: req.params.seriesId
				};
				db.run(query, values, function(error) {
					if(error) {
						next(error);
					}
					db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (error, issue) => {
						res.status(201).json({ issue: issue });
					});
				});
			}
		}
		
	});
});

issuesRouter.put('/:issueId', (req, res, next) => {
	const issue = req.body.issue;
	const name = issue.name;
	const issueNumber = issue.issueNumber;
	const publicationDate = issue.publicationDate;
	const artistId = issue.artistId;
	if(!name || !issueNumber || !publicationDate || !artistId) {
		return res.sendStatus(400);
	} else {
		const query = 'UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId WHERE Issue.id = $issueId';
		const values = { 
			$name: name,
			$issueNumber: issueNumber,
			$publicationDate: publicationDate,
			$artistId: artistId,
			$issueId: req.params.issueId,
		};

		db.run(query, values, (error) => {
			if(error) {
				next(error);
			} else {
				db.get(`SELECT * FROM Issue WHERE Issue.id = ${values.$issueId}`, (error, issue) => {
					res.status(200).json({ issue: issue });
				});
			}
		});
	}
});

issuesRouter.delete('/:issueId', (req, res, next) => {
	const thisIssueId = req.params.issueId;
	db.run(`DELETE FROM Issue WHERE Issue.id = ${thisIssueId}`, (error) => {
		if(error) {
			next(error);
		} else {
			res.status(204).send();
		}
	})
});