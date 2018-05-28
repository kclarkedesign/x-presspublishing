const express = require('express');
const app = express();



//middleware for CORS requests
const cors = require('cors');
app.use(cors());

//middleware for parsing request bodies
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//Development-only error handler middleware.
const errorhandler = require('errorhandler');
if (process.env.NODE_ENV === 'development') {
	app.use(errorhandler());
}

//middleware for logging
const morgan = require('morgan');
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});

const apiRouter = require('./api/api');
app.use('/api', apiRouter);


module.exports = app;
