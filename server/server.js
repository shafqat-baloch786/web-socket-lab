const dotenv = require('dotenv').config();
const PORT = process.env.PORT;
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const socketInit = require('./socket/index');
const db = require('./config/db');

// Connecting database
db();


// Creating http server on express app
const server = http.createServer(app);

// Initialize socket server
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Attaching to express
app.set('socketio', io);

// Setting up the socket connection
io.on('connection', socketInit(io));



// Listening the port 
server.listen(PORT, () => {
    console.log("Server is running at port: ", PORT);
});