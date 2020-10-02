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
  if (file.mimetype.endsWith('pdf')) {
    cb(null, true);
  } else {
    cb(new AppError('Not a Pdf file! Please upload only PDF.', 400), false);
  }
};

const storage = multerS3({
  s3,
  bucket: 'social-coffee-app',
  metadata: function (req: Request, file, cb) {
    cb(null, { filedname: file.fieldname });
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req: Request, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname);

    cb(
      null,
      `${name.replace(/\s/g, '')}-user-${req.user.id}-${Date.now()}${ext}`
    );
  }
});

export const uploadPdfToS3: any = multer({
  storage,
  fileFilter
});
