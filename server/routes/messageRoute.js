const express = require('express');
const router = express.Router();
const { viewAllMessages } = require('../controllers/messageController');
const auth = require('../middleware/auth');


router.get('/messages', auth, viewAllMessages);


module.exports = router;