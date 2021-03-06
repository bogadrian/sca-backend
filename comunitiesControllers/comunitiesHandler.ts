import sharp from 'sharp';

import {RequestHandler, Request, Response, NextFunction} from 'express'

import catchAsync from '../utilis/catchAsync';
import AppError from '../utilis/appError';
import CoffeeProvider from '../models/coffeeProviderModel';

import { uploadPhoto } from '../controllers/s3Uploads'


export const resizeProviderPhotos  = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files) return next();


    await Promise.all(
      (req as any).files.map(async (file: any, i: number) => {
       
        await sharp(file.buffer)
          .resize(500, 400)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
         
      })
    );

    next();
  })


export const uploadProviderImages = uploadPhoto.array('photos', 10);

export const createComunity: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  
  const filterObj = (obj: any, ...allowedFields: string[]) => {
    const newObj: any = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };
  
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody: any = filterObj(req.body, 'name', 'email', 'vat', 'address');
  if (req.files) filteredBody.photos = [];
  let arrayFiles: any = req.files
  let fileLocation; 
  for (let i = 0; i < arrayFiles.length; i++) {
    fileLocation = arrayFiles[i].location
    filteredBody.photos.push(fileLocation)
  }

  // 3) Update user document
  const providerUpdated = await CoffeeProvider.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: providerUpdated
    }
  });
})

