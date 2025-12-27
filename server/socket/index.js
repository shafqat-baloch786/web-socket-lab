const server = require('../server');


// Initialize socket
const socketInit = (io) => {
    return (socket) => {
        console.log("New socket is connected at socket ID: ", socket.id);


    // Print out disconnection information
    io.on('disconnect', () => {
        console.log("Socket disconnected!");
    })
    }

}


module.exports = socketInit;