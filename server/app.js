const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoute = require('./routes/authRoute');



// Cors for Cross Origin Sharing
app.use(cors());

// Helmet to secure Headers from revealing important information
app.use(helmet());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoute);




// Global error middeleware 
app.use(errorMiddleware);

module.exports = app;