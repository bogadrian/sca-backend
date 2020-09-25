import path from 'path';
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
// import formData from 'express-form-data';
// import bodyParser from 'body-parser';
import AppError from './utilis/appError';
import globalErrorHandler from './controllers/errorController';

import userRouter from './routes/userRoutes';
import geoRouter from './routes/geoRouter';
import coffeeProviderRouter from './routes/coffeeProvider';

// Start express app
const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
//app.enable('trust proxy');

// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))
//app.use(formData.parse());
//app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Limit requests from same API
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
// app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));
//app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameters polution
app.use(hpp());

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       // 'duration',
//       // 'ratingsQuantity',
//       // 'ratingsAverage',
//       // 'maxGroupSize',
//       // 'difficulty',
//       // 'price'
//     ]
//   })
// );

app.use(compression());

// 3) ROUTES

app.use('/api/v1/users', userRouter);
app.use('/api/v1/provider', coffeeProviderRouter);
app.use('/api/v1/geo', geoRouter);
//app.use('/api/v1/adms', coffeeProviderRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
