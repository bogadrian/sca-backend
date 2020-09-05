import {Request, Response, NextFunction} from 'express'

import catchAsync from '../utilis/catchAsync';
import AppError from '../utilis/appError';
import APIFeatures from '../utilis/apiFeatures';

import User from '../models/userModel';
import CoffeeProvider from '../models/coffeeProviderModel'

export const getOne: any = (model: string, popOptions: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    
    let query: any;
    
    if (model === 'User') {
      query = User.findById(req.params.id);
    }
    
    if (model === 'CoffeeProvider') {
      query = CoffeeProvider.findById(req.params.id);
    }
   
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

  // ONLY FOR ADMIN 
  export const deleteOne = (Model: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
  
  export const updateOne = (model: string) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    let doc: any;
    
    if (model === 'User'){
      doc = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    }
    
    if (model === 'CoffeeProvider'){
      doc = await CoffeeProvider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    }
    

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
  
  
  
  export const createOne = (Model: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
  
export const getAll = (Model: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features: any = new APIFeatures(Model.find(filter), (req as any).query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
  

