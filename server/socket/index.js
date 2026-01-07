const chatSocket = require('./chatHandler');

const socketInit = (io) => {
    return (socket) => {
        // Pass control to the specialized chat handler
        chatSocket(io, socket);
    };
};

module.exports = socketInit;