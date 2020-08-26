import {Request, Response, NextFunction} from 'express'

type catchAsync = (req: Request, res: Response, next: NextFunction)  => any

const catchAsync = (fn: catchAsync) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync