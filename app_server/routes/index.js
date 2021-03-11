const express = require('express');
const router = express.Router();
const ctrlHome = require('../controllers/home');
const ctrlUsers = require('../controllers/users');

router.get('/', ctrlHome.index);
router.post('/', ctrlHome.postContact);
router.get('/login', ctrlUsers.getLogin);
// router.post('/login', ctrlUsers.postLogin);
router.get('/logout', ctrlUsers.getLogout);
router.get('/forgot', ctrlUsers.getForgot);
router.post('/forgot', ctrlUsers.postForgot);
// router.get('/reset/:token', ctrlUsers.getReset);
// router.post('/reset/:token', ctrlUsers.postReset);
router.get('/signup', ctrlUsers.getSignup);
// router.post('/signup', ctrlUsers.postSignup);

module.exports = router;