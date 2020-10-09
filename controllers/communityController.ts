import { RequestHandler, Request, Response, NextFunction } from 'express';

import catchAsync from '../utilis/catchAsync';
import AppError from '../utilis/appError';
import CoffeeProvider from '../models/coffeeProviderModel';
import Community from '../models/communityModel';
//import fetch from 'node-fetch';
//import fs from 'fs';
//import https from 'https';

// import * as uploads from './s3Uploads';
// import * as pdf from './s3Pdf';

export const createCommunity: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const communityExits: any = await CoffeeProvider.findById(req.user.id);
    console.log(communityExits.community);

    if (communityExits.community !== undefined) {
      return next(
        new AppError('A community for this provider already exists!', 401)
      );
    }

    const newCommunity = await Community.create(req.body);
    const providerUpdated = await CoffeeProvider.findByIdAndUpdate(
      req.user.id,
      { community: newCommunity._id },
      {
        new: true,
        runValidators: false
      }
    );

    if (!newCommunity && !providerUpdated) {
      return next(new AppError('Community was not created', 401));
    }

    res.status(200).json({ status: 'success', data: newCommunity });
  }
);

export const getCommunity: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const community = await Community.findById(req.params.id).exec();

    if (!community) {
      return next(new AppError('Community was not found', 405));
    }

    res.status(200).json({ status: 'success', data: community });
  }
);
