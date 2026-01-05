const Message = require('../models/Message');

// Create message service (usable by both HTTP controller and Socket.IO)
const createMessage = async ({ senderId, partnerId, content }) => {
    return await Message.create({
        sender: senderId,
        receiver: partnerId,
        content
    });
};

module.exports = {
    createMessage
};











