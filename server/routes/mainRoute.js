const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/mainController');
const auth = require("../middleware/auth");


// Main profile router
router.get('/profile', auth, getProfile);



module.exports = router;