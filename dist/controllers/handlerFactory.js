"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = exports.createOne = exports.updateOne = exports.deleteOne = exports.getOne = void 0;
const catchAsync_1 = __importDefault(require("../utilis/catchAsync"));
const appError_1 = __importDefault(require("../utilis/appError"));
const apiFeatures_1 = __importDefault(require("../utilis/apiFeatures"));
const userModel_1 = __importDefault(require("../models/userModel"));
const coffeeProviderModel_1 = __importDefault(require("../models/coffeeProviderModel"));
exports.getOne = (model, popOptions) => catchAsync_1.default(async (req, res, next) => {
    let query;
    if (model === 'User') {
        query = userModel_1.default.findById(req.params.id);
    }
    if (model === 'CoffeeProvider') {
        query = coffeeProviderModel_1.default.findById(req.params.id);
    }
    if (popOptions)
        query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
        return next(new appError_1.default('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});
exports.deleteOne = (Model) => catchAsync_1.default(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new appError_1.default('No document found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});
exports.updateOne = (model) => catchAsync_1.default(async (req, res, next) => {
    let doc;
    if (model === 'User') {
        doc = await userModel_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
    }
    if (model === 'CoffeeProvider') {
        doc = await coffeeProviderModel_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
    }
    if (!doc) {
        return next(new appError_1.default('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});
exports.createOne = (Model) => catchAsync_1.default(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});
exports.getAll = (Model) => catchAsync_1.default(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId)
        filter = { tour: req.params.tourId };
    const features = new apiFeatures_1.default(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const doc = await features.query;
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});
//# sourceMappingURL=handlerFactory.js.map