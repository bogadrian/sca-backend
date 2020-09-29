//import multer from 'multer';
//import sharp from 'sharp';

import { RequestHandler, Request, Response, NextFunction } from 'express';

import User from './../models/userModel';
import catchAsync from '../utilis/catchAsync';
import AppError from '../utilis/appError';

import * as uploads from './s3Uploads';

type IfilterObj = (obj: any, ...allowedFields: string[]) => any;

const filterObj: IfilterObj = (obj, ...allowedFields) => {
  const newObj: any = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const uploadPhoto = uploads.uploadPhoto.single('photo');

export const updateMe: RequestHandler = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
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
    let filteredBody: any;
    filteredBody = filterObj(req.body, 'name', 'description');
    if (req.file) filteredBody.photo = req.file.location;

    if (!filteredBody.name) {
      filteredBody.name = req.user.name;
    }

    if (!filteredBody.description) {
      filteredBody.description = req.user.description;
    }

    if (!filteredBody.photo) {
      filteredBody.photo = req.user.photo;
    }
    // 3) Update user document
    const updatedUser: any = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: false
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  }
);

// implemented refactor ???
export const deleteMe: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

export const createUser: RequestHandler = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};
