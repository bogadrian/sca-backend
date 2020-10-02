import { RequestHandler, Request, Response, NextFunction } from 'express';

import catchAsync from '../utilis/catchAsync';
import AppError from '../utilis/appError';
import CoffeeProvider from '../models/coffeeProviderModel';

//import fetch from 'node-fetch';
//import fs from 'fs';
//import https from 'https';

import * as uploads from './s3Uploads';
import * as pdf from './s3Pdf';

export const uploadProviderImages = uploads.uploadPhoto.array('images', 10);

export const updateMeProvider: RequestHandler = catchAsync(
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

    const filterObj = (obj: any, ...allowedFields: string[]) => {
      const newObj: any = {};
      Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
      });
      return newObj;
    };

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    let filteredBody: any;
    filteredBody = filterObj(req.body, 'name', 'description');

    if (req.files) {
      filteredBody.images = req.files.map((file: any) => {
        return file.location;
      });
      filteredBody.photo = req.files[0].location;
    }

    if (!filteredBody.name) {
      filteredBody.name = req.user.name;
    }

    if (!filteredBody.description) {
      filteredBody.description = req.user.description;
    }

    if (!filteredBody.images) {
      filteredBody.images = [req.user.images[0]];
    }

    if (!filteredBody.photo) {
      filteredBody.photo = req.user.photo;
    }

    // 3) Update user document
    const providerUpdated = await CoffeeProvider.findByIdAndUpdate(
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
        user: providerUpdated
      }
    });
  }
);

// implemented
export const deleteMe: RequestHandler = catchAsync(
  async (req: any, res, next) => {
    await CoffeeProvider.findByIdAndUpdate(req.user.id, { active: false });

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

export const getMe: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.params.id = req.user.id;
  next();
};

export const getCount: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const filter = {};
    const response = await CoffeeProvider.find(filter);

    return res.status(200).json({
      status: 'success',
      results: response.length
    });
  }
);

export const writeMenuUrl: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await CoffeeProvider.findByIdAndUpdate(req.user.id, {
      menuUrl: req.body.urlProvider
    });

    return res.status(200).json({
      status: 'success',
      data: response
    });
  }
);

export const uploadPdfS3 = pdf.uploadPdfToS3.single('pdf');

export const uploadPdf: RequestHandler = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const filePdf = req.file.location;

    const providerUpdated = await CoffeeProvider.findByIdAndUpdate(
      req.user.id,
      { s3MenuLink: filePdf },
      {
        new: true,
        runValidators: false
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        user: providerUpdated
      }
    });
  }
);

export const redirectToPdf: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerMenu: any = await CoffeeProvider.findOne({
      menuUrl: req.params.providerSlug
    });

    const url = providerMenu.s3MenuLink;

    res.redirect(url);
  }
);
export const redirectToPdfFromMobileApp: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerMenu: any = await CoffeeProvider.findOne({
      menuUrl: req.params.providerSlug
    });

    const url = providerMenu.s3MenuLink;

    res.status(200).json({ status: 'success', data: url });
  }
);
