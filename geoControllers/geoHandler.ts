import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import catchAsync from '../utilis/catchAsync';
import AppError from '../utilis/appError';

import CoffeeProvider from '../models/coffeeProviderModel';

export const getCoordsForAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { city } = req.body.data;
    console.log(city);

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=
          ${city}&key=${process.env.GEO_COORDS_FROM_ADDRESS}`
    );

    const { data } = response;

    if (!data || data.status === 'ZERO_RESULTS') {
      return next(
        new AppError('Could not find location for the specified address.', 422)
      );
    }

    const coordinates = data.results[0].geometry.location;

    res.status(200).json({
      status: 'success',
      data: coordinates
    });
  }
);
export const getProvidersWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius: number = (distance as any) / 6378.1;
  console.log(radius, lat, lng);

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const providers = await CoffeeProvider.find({
    position: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });

  res.status(200).json({
    status: 'success',
    results: providers.length,
    data: {
      data: providers
    }
  });
});
