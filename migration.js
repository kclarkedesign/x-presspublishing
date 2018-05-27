var sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

db.serialize(() => {
	db.run('DROP TABLE IF EXISTS Artist', error => {
		if(error) {
			throw error; 
		}
	});
	db.run(`CREATE TABLE Artist (
		id INTEGER PRIMARY KEY,
		name TEXT NOT NULL,
		date_of_birth TEXT NOT NULL,
		biography TEXT NOT NULL,
		is_currently_employed INTEGER DEFAULT 1);`);
});