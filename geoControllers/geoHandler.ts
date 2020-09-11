import { Request, Response, NextFunction} from 'express'
import axios from 'axios'
import catchAsync from '../utilis/catchAsync';
import AppError from '../utilis/appError';


export const getCoordsForAddress = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
     
      const { city } = req.body.data
      console.log(city)
  
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=
          ${city}&key=${process.env.GEO_COORDS_FROM_ADDRESS}`
      );
  
      const { data } = response;
  
      if (!data || data.status === 'ZERO_RESULTS') {
        return next(
          new AppError(
            'Could not find location for the specified address.',
            422
          )
        )
      }
  
      const coordinates = data.results[0].geometry.location;
  
      res.status(200).json({
        status: 'success',
        data: coordinates
      });
    }
  );