import express from 'express';

import {getCoordsForAddress} from '../geoControllers/geoHandler';


const router = express.Router();

router.post('/address', getCoordsForAddress)



export default router;