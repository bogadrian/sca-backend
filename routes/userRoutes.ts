import express from 'express';
import * as userController from '../controllers/userController';
import * as authController from '../controllers/authController';
import * as authFactory from '../controllers/authFactory';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.get('/confirmation/:emailToken/:name', authController.emailConfirm);
router.patch('/resend-confirmation', authController.resendEmailConfirmation);

// Protect all routes after this middleware
router.use(authController.protectUser);

router.get('/getMe', authController.getMe);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/getUser', authFactory.getMe, authController.getUser);

router.patch('/updateMe', userController.uploadPhoto, userController.updateMe);

router.delete('/deleteMe', userController.deleteMe);

export default router;
