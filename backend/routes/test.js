const express = require('express');
const router = express.Router();

// @route   GET /api/test
// @desc    Tests test route
// @access  Public
router.get('/', (req, res) => res.json({ msg: 'API is working' }));

module.exports = router;
