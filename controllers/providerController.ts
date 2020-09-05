

import multer from 'multer';
import sharp from 'sharp';

import {RequestHandler, Request, Response, NextFunction} from 'express'


import catchAsync from '../utilis/catchAsync';
import AppError from '../utilis/appError';
import CoffeeProvider from '../models/coffeeProviderModel';
//import * as factory from './handlerFactory';


export const multerStorage = multer.memoryStorage();

export const multerFilter = (req: Request, file: any, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

export const uploadProviderImages = upload.array('images', 10);

export const resizeProviderPhotos  = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files) return next();

    //2) Images

    req.body.images = [];

    await Promise.all(
      (req as any).files.map(async (file: any, i: number) => {
        const filename = `place-${
          req.user.id
        }-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(500, 400)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/places/${filename}`);

        req.body.images.push(filename);
      })
    );

    next();
  }
);
type IfilterObj = (obj: any, arg2: string, arg3: string) => any

const filterObj: IfilterObj = (obj, ...allowedFields) => {
  const newObj: any = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


export const updateMeProvider: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser: any = await CoffeeProvider.findByIdAndUpdate(req.user.id, filteredBody, {
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

// implemented
export const deleteMe: RequestHandler = catchAsync(async (req: any, res, next) => {
  await CoffeeProvider.findByIdAndUpdate(req.user.id, { active: false });

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

export const getMe: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req.user.id;
  next();
};