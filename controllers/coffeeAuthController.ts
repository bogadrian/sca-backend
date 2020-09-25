import * as authFactory from './authFactory';
import * as factory from './handlerFactory';

import { NextFunction, Request, Response } from 'express';
import AppError from '../utilis/appError';

export const signup = authFactory.signup('CoffeeProvider');
export const login = authFactory.login('CoffeeProvider');
export const logout = authFactory.logout();
export const protect = authFactory.protect('CoffeeProvider');
export const emailConfirm = authFactory.emailConfirm('CoffeeProvider');
export const resendEmailConfirmation = authFactory.resendEmailConfirmationToken(
  'CoffeeProvider'
);
export const getMe = authFactory.getMeFromToken('CoffeeProvider');

export const forgotPassword = authFactory.forgotPassword('CoffeeProvider');
export const resetPassword = authFactory.resetPassword('CoffeeProvider');
export const updatePassword = authFactory.updatePassword('CoffeeProvider');
export const test = authFactory.test();
export const getUser = factory.getOne('CoffeeProvider');

// Only for rendered pages, no errors!
// export const isLoggedIn: RequestHandler = async (req, res, next) => {
//   if (req.cookies.jwt) {
//     try {
//       // 1) verify token
//       const decoded = await promisify(jwt.verify)(
//         req.cookies.jwt,
//         process.env.JWT_SECRET
//       );

//       // 2) Check if user still exists
//       const currentUser = await User.findById(decoded.id);
//       if (!currentUser) {
//         return next();
//       }

//       // 3) Check if user changed password after the token was issued
//       if (currentUser.changedPasswordAfter(decoded.iat)) {
//         return next();
//       }

//       // THERE IS A LOGGED IN USER
//       res.locals.user = currentUser;
//       return next();
//     } catch (err) {
//       return next();
//     }
//   }
//   next();
// };
type Restrict = (
  roles: string
) => (req: Request, res: Response, next: NextFunction) => void;

export const restrictTo: Restrict = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
