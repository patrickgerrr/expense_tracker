const authRouter = require('express').Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

authRouter.post('/signup', authLimiter, authController.signup);

authRouter.post('/login', authLimiter, authController.login);

authRouter.post('/checkuser', authLimiter, authController.checkUser);

authRouter.get('/getKey',authController.getKey);

module.exports = authRouter;