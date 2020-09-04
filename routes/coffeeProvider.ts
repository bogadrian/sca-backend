import express from 'express';

import * as coffeeAuthController from '../controllers/coffeeAuthController';

const router = express.Router();

router.post('/signup', coffeeAuthController.signup);
router.post('/login', coffeeAuthController.login);
router.get('/logout', coffeeAuthController.logout);

router.post('/forgotPassword', coffeeAuthController.forgotPassword);
router.patch('/resetPassword/:token', coffeeAuthController.resetPassword);

// Protect all routes after this middleware
router.use(coffeeAuthController.protect);

 router.patch('/updateMyPassword', coffeeAuthController.updatePassword);
// router.get('/me', coffeeAuthController.getMe, coffeeAuthController.getUser);
// router.patch(
//   '/updateMe',
//   coffeeAuthController.uploadUserPhoto,
//   coffeeAuthController.resizeUserPhoto,
//   coffeeAuthController.updateMe
// );

// router.delete('/deleteMe', coffeeAuthController.deleteMe);

//something-not-easy-to-guess = admin; 
router.use(coffeeAuthController.restrictTo('something-not-easy-to-guess'));

router.route('/test').get(coffeeAuthController.test)

// router
//   .route('/')
//   .get(userController.getAllUsers)
//   .post(userController.createUser);

// router
//   .route('/:id')
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);
//   // one more for block user for n time

export default router;