"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.createUser = exports.deleteMe = exports.updateMeProvider = void 0;
const catchAsync_1 = __importDefault(require("../utilis/catchAsync"));
const appError_1 = __importDefault(require("../utilis/appError"));
const coffeeProviderModel_1 = __importDefault(require("../models/coffeeProviderModel"));
exports.updateMeProvider = catchAsync_1.default(async (req, res, next) => {
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
exports.deleteMe = catchAsync_1.default(async (req, res, next) => {
    await coffeeProviderModel_1.default.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    });
});
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead'
    });
};
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};
//# sourceMappingURL=providerController.js.map