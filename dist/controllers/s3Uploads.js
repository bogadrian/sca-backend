"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhoto = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const path_1 = __importDefault(require("path"));
const appError_1 = __importDefault(require("../utilis/appError"));
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ID_KEY,
    secretAccessKey: process.env.AWS_SECRET,
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(new appError_1.default('Not an image! Please upload only images.', 400), false);
    }
};
const storage = multer_s3_1.default({
    s3,
    bucket: 'social-coffee-app',
    metadata: function (req, file, cb) {
        cb(null, { filedname: file.fieldname });
    },
    key: function (req, file, cb) {
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname);
        cb(null, `${name.replace(/\s/g, '')}-user-${req.user.id}-${Date.now()}${ext}`);
    }
});
exports.uploadPhoto = multer_1.default({
    storage,
    fileFilter,
});
//# sourceMappingURL=s3Uploads.js.map