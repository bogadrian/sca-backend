"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendEmailConfirmationToken = exports.emailConfirm = exports.getMe = exports.test = exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.protect = exports.logout = exports.login = exports.signup = void 0;
const crypto_1 = __importDefault(require("crypto"));
const util_1 = require("util");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const coffeeProviderModel_1 = __importDefault(require("../models/coffeeProviderModel"));
const catchAsync_1 = __importDefault(require("../utilis/catchAsync"));
const appError_1 = __importDefault(require("../utilis/appError"));
const email_1 = __importDefault(require("../utilis/email"));
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};
const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};
exports.signup = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        let newUser;
        if (model === 'User') {
            newUser = await userModel_1.default.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm
            });
        }
        if (model === 'CoffeeProvider') {
            newUser = await coffeeProviderModel_1.default.create({
                name: req.body.activityName,
                email: req.body.email,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm,
                vat: req.body.vat,
                address: req.body.address,
                position: req.body.position
            });
        }
        const emailToken = newUser.createEmailConfirmToken();
        await newUser.save({ validateBeforeSave: false });
        let routeUserType;
        if (model === 'User') {
            routeUserType = 'users';
        }
        if (model === 'CoffeeProvider') {
            routeUserType = 'provider';
        }
        const url = `${req.protocol}://${req.get('host')}/api/v1/${routeUserType}/confirmation/${emailToken}/${newUser.name}`;
        await new email_1.default(newUser, url).sendWelcome();
        createSendToken(newUser, 201, req, res);
    });
};
const reactivateUser = async (email, model) => {
    let user;
    if (model === 'User') {
        await userModel_1.default.update({ email }, { $set: { active: true } }, { new: false }, (error, doc) => {
            if (error) {
                console.log("Something wrong when updating data!");
            }
            user = doc;
        });
    }
    if (model === 'CoffeeProvider') {
        await coffeeProviderModel_1.default.update({ email }, { $set: { active: true } }, { new: false }, (error, doc) => {
            if (error) {
                console.log("Something wrong when updating data!");
            }
            user = doc;
        });
    }
    return user;
};
exports.login = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new appError_1.default('Please provide email and password!', 400));
        }
        let user;
        user = reactivateUser(email, model);
        if (model === 'User') {
            user = await userModel_1.default.findOne({ email }).select('+password -__v');
            console.log(user);
        }
        if (model === 'CoffeeProvider') {
            user = await coffeeProviderModel_1.default.findOne({ email }).select('+password -__v');
        }
        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new appError_1.default('Incorrect email or password', 401));
        }
        createSendToken(user, 200, req, res);
    });
};
exports.logout = () => {
    return (req, res) => {
        res.cookie('jwt', 'loggedout', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });
        res.status(200).json({ status: 'success', token: '', data: '' });
    };
};
exports.protect = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }
        if (!token) {
            return next(new appError_1.default('You are not logged in! Please log in to get access.', 401));
        }
        const decoded = await util_1.promisify(jsonwebtoken_1.default.verify)(token, process.env.JWT_SECRET);
        let currentUser;
        if (model === 'User') {
            currentUser = await userModel_1.default.findById(decoded.id);
            if (!currentUser) {
                return next(new appError_1.default('The user belonging to this token does no longer exist.', 401));
            }
        }
        if (model === 'CoffeeProvider') {
            currentUser = await coffeeProviderModel_1.default.findById(decoded.id);
            if (!currentUser) {
                return next(new appError_1.default('The user belonging to this token does no longer exist.', 401));
            }
        }
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new appError_1.default('User recently changed password! Please log in again.', 401));
        }
        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    });
};
exports.forgotPassword = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        let user;
        if (model === 'User') {
            user = await userModel_1.default.findOne({ email: req.body.email });
        }
        if (model === 'CoffeeProvider') {
            user = await coffeeProviderModel_1.default.findOne({ email: req.body.email });
        }
        if (!user) {
            return next(new appError_1.default('There is no user with email address.', 404));
        }
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        try {
            const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
            await new email_1.default(user, resetURL).sendPasswordReset();
            res.status(200).json({
                status: 'success',
                message: 'Token sent to email!'
            });
        }
        catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return next(new appError_1.default('There was an error sending the email. Try again later!', 500));
        }
    });
};
exports.resetPassword = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');
        let user;
        if (model === 'User') {
            user = await userModel_1.default.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: { $gt: Date.now() }
            });
        }
        if (model === 'CoffeeProvider') {
            user = await coffeeProviderModel_1.default.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: { $gt: Date.now() }
            });
        }
        if (!user) {
            return next(new appError_1.default('Token is invalid or has expired', 400));
        }
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        createSendToken(user, 200, req, res);
    });
};
exports.updatePassword = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        let user;
        if (model === 'User') {
            user = await userModel_1.default.findById(req.user.id).select('+password');
        }
        if (model === 'CoffeeProvider') {
            user = await coffeeProviderModel_1.default.findById(req.user.id).select('+password');
        }
        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            return next(new appError_1.default('Your current password is wrong.', 401));
        }
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();
        createSendToken(user, 200, req, res);
    });
};
exports.test = () => {
    return (req, res) => {
        res.status(200).json({ status: 'success',
            data: {
                message: 'Test restrict to admin is working'
            }
        });
    };
};
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};
exports.emailConfirm = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        if (!req.params.emailToken || !req.params.name) {
            return next(new appError_1.default('We could not verify your email. Please try agian', 500));
        }
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(req.params.emailToken)
            .digest('hex');
        let user;
        if (model === 'User') {
            user = await userModel_1.default.findOne({
                emailConfirmToken: hashedToken
            });
        }
        if (model === 'CoffeeProvider') {
            user = await coffeeProviderModel_1.default.findOne({
                emailConfirmToken: hashedToken
            });
        }
        if (!user) {
            return next(new appError_1.default('Sorry but we could not confirm your email, please try again!', 400));
        }
        if (model === 'User') {
            await userModel_1.default.findOneAndUpdate({ _id: user._id }, { $set: { emailConfirm: true } });
        }
        if (model === 'CoffeeProvider') {
            await coffeeProviderModel_1.default.findOneAndUpdate({ _id: user._id }, { $set: { emailConfirm: true } });
        }
        user.emailConfirmToken = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(200).render('emailConfirm', { name: req.params.name });
    });
};
exports.resendEmailConfirmationToken = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        let user;
        if (model === 'User') {
            user = await userModel_1.default.findOne({ email: req.body.email });
        }
        if (model === 'CoffeeProvider') {
            user = await coffeeProviderModel_1.default.findOne({ email: req.body.email });
        }
        if (!user) {
            return next(new appError_1.default('There is no user with email address.', 404));
        }
        const token = user.createEmailConfirmToken();
        await user.save({ validateBeforeSave: false });
        let routeUserType;
        if (model === 'User') {
            routeUserType = 'users';
        }
        if (model === 'CoffeeProvider') {
            routeUserType = 'provider';
        }
        const url = `${req.protocol}://${req.get('host')}/api/v1/${routeUserType}/confirmation/${token}/${user.name}`;
        await new email_1.default(user, url).sendResetEmailConfirmationToken();
        res.status(200).json({
            status: 'success',
            data: {
                message: 'A new email was sent to you!'
            }
        });
    });
};
//# sourceMappingURL=authFactory.js.map