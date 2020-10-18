import express from 'express';

import { getCoordsForAddress } from '../geoControllers/geoHandler';

import { getProvidersWithin } from '../geoControllers/geoHandler';

const router = express.Router();

router.post('/address', getCoordsForAddress);

router
  .route('/providers-within/:distance/center/:latlng')
  .get(getProvidersWithin);

export default router;
