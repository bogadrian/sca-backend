import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';


import {NextFunction, Request, Response, RequestHandler} from 'express'

import User from '../models/userModel';
import CoffeeProvider from '../models/coffeeProviderModel'

import catchAsync from '../utilis/catchAsync';
import AppError from '../utilis/appError';
import Email from '../utilis/email';

type SignToken = (id: string) => string;
const signToken: SignToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

type CreateSignToken = (user: any, statusCode: number, req: Request, res: Response) => void
const createSendToken: CreateSignToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN! as any) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};


// const formatLocation = (coords: any) => {
//     const lnglat = coords;
//     const coord = lnglat.split(',');
//     const coordinates = coord.map((coor:any) => {
//     return coor * 1;
//     });
//     const position = { coordinates };
//     return position
// }
type FuncM = (model: string) => RequestHandler;
type Func = () => RequestHandler;


export const signup: FuncM  = (model) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {

        let newUser: any;
        if (model === 'User') {
            newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        }); 
        }
  
        if (model === 'CoffeeProvider') {
            newUser = await CoffeeProvider.create({
            name: req.body.activityName,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            vat: req.body.vat,
            address: req.body.address,
            position: req.body.position // formatLocation(req.body.position)
            }); 
        }   
        
        // call a function which hashes a token to be sent in email 
        const emailToken = newUser.createEmailConfirmToken()
        await newUser.save({ validateBeforeSave: false });
        
        let routeUserType: any; 
        
        if (model === 'User') {
        routeUserType = 'users'
        }
        
        if (model === 'CoffeeProvider') {
          routeUserType = 'provider'
        }
        
   const url = `${req.protocol}://${req.get('host')}/api/v1/${routeUserType}/confirmation/${emailToken}/${newUser.name}`;
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, req, res);
});
}

const reactivateUser = async(email: string, model: string) => {
  let user: any;
  if (model === 'User') {
    await User.update({email}, {$set: { active: true }}, {new: false}, (error: any, doc: any) =>  {
      if (error) {
      console.log("Something wrong when updating data!");
     }
     user = doc;
    })
  }
  if (model === 'CoffeeProvider') {
    await CoffeeProvider.update({email}, {$set: { active: true }}, {new: false}, (error: any, doc: any) =>  {
      if (error) {
      console.log("Something wrong when updating data!");
     }
    user = doc;
     })
   }
  return user; 
  }
 
export const login: FuncM  = (model) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  let user: any;
  
  user = reactivateUser(email, model);
  
  if (model === 'User') {
    user = await User.findOne({ email }).select('+password -__v'); 
    console.log(user)
  }
  
  if (model === 'CoffeeProvider') {
    user = await CoffeeProvider.findOne({ email }).select('+password -__v');
  }
 
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
 });
}

export const logout: Func  = () => {
  return (req: Request, res: Response) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
  res.status(200).json({ status: 'success', token: '', data: '' });
  } 
}

export const protect: FuncM  = (model) => {
   return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded: any = await promisify(jwt.verify)(token, process.env.JWT_SECRET!);

  // 3) Check if user still exists
  let currentUser: any;
  if (model === 'User') {
     currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  }
  if (model === 'CoffeeProvider') {
     currentUser = await CoffeeProvider.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
}

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

//type Restrict = (roles: string) => any;

// export const restrictTo: Restrict = (...roles) => {

//   return (req: Request, res: Response, next: NextFunction) => {
//     console.log(roles)
    
//     console.log(req.user)
//     // roles ['admin', 'lead-guide']. role='user'
//     // if (!roles.includes(req.user)) {
//     //   return next(
//     //     new AppError('You do not have permission to perform this action', 403)
//     //   );
//     // }

//     next();
//   };
// };


export const forgotPassword: FuncM = (model) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get user based on POSTed email
  
  let user: any;
  
  if (model === 'User') {
    user = await User.findOne({ email: req.body.email });
  }
  
  if (model === 'CoffeeProvider') {
    user = await CoffeeProvider.findOne({ email: req.body.email });
  }
  
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!',
      500
    ))
  }
});
}

export const resetPassword: FuncM = (model) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    let user: any;
    
    if (model === 'User') {
        user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
        });
    }
    
    if (model === 'CoffeeProvider') {
        user = await CoffeeProvider.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
        });
    }
  

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
}); 
}

export const updatePassword: FuncM = (model) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  // 1) Get user from collection
  
  let user: any;
  
  if (model === 'User') {
    user = await User.findById(req.user.id).select('+password');
  }
  
  if (model === 'CoffeeProvider') {
    user = await CoffeeProvider.findById(req.user.id).select('+password');
  }
  

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
  }); 
}

export const test = () => {
  return (req: Request, res: Response) => {
    
    res.status(200).json({ status: 'success',
     data: { 
       message: 'Test restrict to admin is working'
      }
    })
  }
}

export const getMe: RequestHandler = (req: any, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const emailConfirm: FuncM  = (model) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // emailConfirm handler
    
    if( !req.params.emailToken || !req.params.name) {
      return next(
        new AppError('We could not verify your email. Please try agian',
        500
      ))
    }
    // check if the token in req.params.emailToken is same with token saved in db and then set it to undefind or return an error
  
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.emailToken)
    .digest('hex');

    let user: any;
    
    if (model === 'User') {
        user = await User.findOne({
        emailConfirmToken: hashedToken
        });
    }
    
    if (model === 'CoffeeProvider') {
        user = await CoffeeProvider.findOne({
          emailConfirmToken: hashedToken
        });
    }
  
  if (!user) {
    return next(new AppError('Sorry but we could not confirm your email, please try again!', 400));
  }

  if (model === 'User') {
    await User.findOneAndUpdate({_id: user._id}, {$set: {emailConfirm: true}})
  }
  
  if (model === 'CoffeeProvider') {
    await CoffeeProvider.findOneAndUpdate({_id: user._id}, {$set: {emailConfirm: true}})
  }
  
  user.emailConfirmToken = undefined;
  await user.save({ validateBeforeSave: false });
  
    res.status(200).render('emailConfirm', {name: req.params.name});
  }) 
}

export const resendEmailConfirmationToken: FuncM  = (model) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let user: any;
  
  if (model === 'User') {
    user = await User.findOne({ email: req.body.email });
  }
  
  if (model === 'CoffeeProvider') {
    user = await CoffeeProvider.findOne({ email: req.body.email });
  }
  
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  const token = user.createEmailConfirmToken()
   await user.save({ validateBeforeSave: false });
 
        let routeUserType: any; 
        
        if (model === 'User') {
        routeUserType = 'users'
        }
        
        if (model === 'CoffeeProvider') {
          routeUserType = 'provider'
        }
        
   const url = `${req.protocol}://${req.get('host')}/api/v1/${routeUserType}/confirmation/${token}/${user.name}`;
    await new Email(user, url).sendResetEmailConfirmationToken();
    
    res.status(200).json({
      status: 'success', 
      data: {
      message: 'A new email was sent to you!'
    }
  })
  })
}