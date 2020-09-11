"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComunity = exports.uploadProviderImages = exports.resizeProviderPhotos = void 0;
const sharp_1 = __importDefault(require("sharp"));
const catchAsync_1 = __importDefault(require("../utilis/catchAsync"));
const appError_1 = __importDefault(require("../utilis/appError"));
const coffeeProviderModel_1 = __importDefault(require("../models/coffeeProviderModel"));
const s3Uploads_1 = require("../controllers/s3Uploads");
exports.resizeProviderPhotos = catchAsync_1.default(async (req, res, next) => {
    if (!req.files)
        return next();
    await Promise.all(req.files.map(async (file, i) => {
        await sharp_1.default(file.buffer)
            .resize(500, 400)
            .toFormat('jpeg')
            .jpeg({ quality: 90 });
    }));
    next();
});
exports.uploadProviderImages = s3Uploads_1.uploadPhoto.array('photos', 10);
exports.createComunity = catchAsync_1.default(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new appError_1.default('This route is not for password updates. Please use /updateMyPassword.', 400));
    }
    const filterObj = (obj, ...allowedFields) => {
        const newObj = {};
        Object.keys(obj).forEach(el => {
            if (allowedFields.includes(el))
                newObj[el] = obj[el];
        });
        return newObj;
    };
    const filteredBody = filterObj(req.body, 'name', 'email', 'vat', 'address');
    if (req.files)
        filteredBody.photos = [];
    let arrayFiles = req.files;
    let fileLocation;
    for (let i = 0; i < arrayFiles.length; i++) {
        fileLocation = arrayFiles[i].location;
        filteredBody.photos.push(fileLocation);
    }
    const providerUpdated = await coffeeProviderModel_1.default.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: 'success',
        data: {
            user: providerUpdated
        }
    });
});
//# sourceMappingURL=comunitiesHandler.js.map