// import multer from 'multer';
 import sharp from 'sharp';

import {RequestHandler, Request, Response, NextFunction} from 'express'

import User from './../models/userModel';
import catchAsync from '../utilis/catchAsync';
import AppError from '../utilis/appError';

import * as uploads from './s3Uploads'



export const resizeUserPhoto = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  //req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    //.toFile(`public/img/users/${req.file.filename}`);

   
  next();
});

type IfilterObj = (obj: any, ...allowedFields: string[]) => any

const filterObj: IfilterObj = (obj, ...allowedFields) => {
  const newObj: any = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


export const uploadPhoto = uploads.uploadPhoto.single('photo')


export const updateMe: RequestHandler = catchAsync(async (req: any, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody: any = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.location;

  // 3) Update user document
  const updatedUser: any = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});


// implemented refactor ??? 
export const deleteMe: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const createUser: RequestHandler= (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};

