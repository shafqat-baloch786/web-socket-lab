const express = require('express');
const router = express.Router();
const { getProfile, editProfile } = require('../controllers/mainController');
const auth = require("../middleware/auth");


// Main profile router
router.get('/profile', auth, getProfile);

// Edit profile
router.patch('/edit-profile', auth, editProfile);



module.exports = router;