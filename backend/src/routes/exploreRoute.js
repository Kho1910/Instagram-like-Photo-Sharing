const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/exploreController');
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, exploreController.getExplore);

module.exports = router;