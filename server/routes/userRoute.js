const { allUsers } = require('../controllers/userController');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();


// Route to view all users
router.get('/all', auth, allUsers);

module.exports = router;