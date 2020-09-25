import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

import { Request } from 'express';
import AppError from '../utilis/appError';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ID_KEY,
  secretAccessKey: process.env.AWS_SECRET
});

const fileFilter = (req: Request, file: any, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const storage = multerS3({
  s3,
  bucket: 'social-coffee-app',
  metadata: function (req: Request, file, cb) {
    cb(null, { filedname: file.fieldname });
  },
  key: function (req: Request, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname);

    cb(
      null,
      `${name.replace(/\s/g, '')}-user-${req.user.id}-${Date.now()}${ext}`
    );
  }
});

export const uploadPhoto: any = multer({
  storage,
  fileFilter
});
