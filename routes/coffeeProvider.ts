import express from 'express';

import * as coffeeAuthController from '../controllers/coffeeAuthController';
import * as authFactory from '../controllers/authFactory';
import * as providerController from '../controllers/providerController';

const router = express.Router();

router.post('/signup', coffeeAuthController.signup);
router.post('/login', coffeeAuthController.login);
router.get('/logout', coffeeAuthController.logout);

router.post('/forgotPassword', coffeeAuthController.forgotPassword);
router.patch('/resetPassword/:token', coffeeAuthController.resetPassword);

router.get(
  '/confirmation/:emailToken/:name',
  coffeeAuthController.emailConfirm
);
router.patch(
  '/resend-confirmation',
  coffeeAuthController.resendEmailConfirmation
);
router.get('/getMe', coffeeAuthController.getMe);
// Protect all routes after this middleware
router.use(coffeeAuthController.protect);

router.patch('/updateMyPassword', coffeeAuthController.updatePassword);

router.get('/getCount', providerController.getCount);

router.get('/me', authFactory.getMe, coffeeAuthController.getUser);
router.patch(
  '/updateMe',
  // use this routes on createComunity
  // providerController.resizeProviderPhotos,
  providerController.uploadProviderImages,
  providerController.updateMeProvider
);

router.delete('/deleteMe', providerController.deleteMe);

router.patch('/writeUrl', providerController.writeMenuUrl);

//something-not-easy-to-guess = admin;
router.use(coffeeAuthController.restrictTo('something-not-easy-to-guess'));

router.route('/test').get(coffeeAuthController.test);

// implement this for admin /api/v1/adms/

// router
//   .route('/')
//   .get(userController.getAllProviders)
//   .post(userController.createProvider);

// router
//   .route('/:id')
//   .get(userController.getProvider)
//   .patch(userController.updateProvider)
//   .delete(userController.deleteProvider);
//   .patch(userController.blockProvider);
//

export default router;
