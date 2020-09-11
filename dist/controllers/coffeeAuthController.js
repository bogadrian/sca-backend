"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.getUser = exports.test = exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.resendEmailConfirmation = exports.emailConfirm = exports.protect = exports.logout = exports.login = exports.signup = void 0;
const authFactory = __importStar(require("./authFactory"));
const factory = __importStar(require("./handlerFactory"));
const appError_1 = __importDefault(require("../utilis/appError"));
exports.signup = authFactory.signup('CoffeeProvider');
exports.login = authFactory.login('CoffeeProvider');
exports.logout = authFactory.logout();
exports.protect = authFactory.protect('CoffeeProvider');
exports.emailConfirm = authFactory.emailConfirm('CoffeeProvider');
exports.resendEmailConfirmation = authFactory.resendEmailConfirmationToken('CoffeeProvider');
exports.forgotPassword = authFactory.forgotPassword('CoffeeProvider');
exports.resetPassword = authFactory.resetPassword('CoffeeProvider');
exports.updatePassword = authFactory.updatePassword('CoffeeProvider');
exports.test = authFactory.test();
exports.getUser = factory.getOne('CoffeeProvider');
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log(req.user.role);
        if (!roles.includes(req.user.role)) {
            return next(new appError_1.default('You do not have permission to perform this action', 403));
        }
        next();
    };
};
//# sourceMappingURL=coffeeAuthController.js.map