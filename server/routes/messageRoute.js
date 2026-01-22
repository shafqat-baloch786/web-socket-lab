const express = require('express');
const router = express.Router();
const { viewAllMessages, viewConversation, sendMessage, deleteConversation } = require('../controllers/messageController');
const auth = require('../middleware/auth');


// View all messages
router.get('/messages', auth, viewAllMessages);

// View single conversation of any partner/person
router.get('/conversation/:partnerId', auth, viewConversation);

// Sending message
router.post('/conversation/:partnerId', auth, sendMessage);

// Deleting conversation
router.delete('/conversation/:partnerId', auth, deleteConversation);

module.exports = router;