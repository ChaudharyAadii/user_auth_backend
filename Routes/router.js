const express = require('express');
const controllers = require('../controllers/userControllers');
const router = new express.Router();

router.post('/user/register', controllers.userregister)
router.post('/user/sendotp', controllers.userOtpSend)
router.post('/user/login', controllers.userLogin)


module.exports = router;