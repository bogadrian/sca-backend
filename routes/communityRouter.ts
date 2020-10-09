import express from 'express';

//import * as coffeeAuthController from '../controllers/coffeeAuthController';
// import * as authFactory from '../controllers/authFactory';
// import * as providerController from '../controllers/providerController';
import * as coffeeController from '../controllers/coffeeAuthController';
import * as communityController from '../controllers/communityController';

const router = express.Router();

// PROTECTED ROUTES FROM HERE
router.use(coffeeController.protectProvider);

router.post('/createCommunity', communityController.createCommunity);
router.get('/getCommunity/:id', communityController.getCommunity);
export default router;
