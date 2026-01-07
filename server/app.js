const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoute = require('./routes/authRoute');
const mainRoute = require('./routes/mainRoute');
const messagesRoute = require('./routes/messageRoute');
const userRoute = require('./routes/userRoute');


// Cors for Cross Origin Sharing
app.use(cors());

// Helmet to secure Headers from revealing important information
app.use(helmet());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use('/api/auth', authRoute);

// Main routes
app.use('/api/main', mainRoute);

// Messages routes
app.use('/api', messagesRoute);

// Users route
app.use('/api/users', userRoute);



// Global error middeleware 
app.use(errorMiddleware);

module.exports = app;