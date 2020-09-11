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
const express_1 = __importDefault(require("express"));
const coffeeAuthController = __importStar(require("../controllers/coffeeAuthController"));
const authFactory = __importStar(require("../controllers/authFactory"));
const providerController = __importStar(require("../controllers/providerController"));
const router = express_1.default.Router();
router.post('/signup', coffeeAuthController.signup);
router.post('/login', coffeeAuthController.login);
router.get('/logout', coffeeAuthController.logout);
router.post('/forgotPassword', coffeeAuthController.forgotPassword);
router.patch('/resetPassword/:token', coffeeAuthController.resetPassword);
router.get('/confirmation/:emailToken/:name', coffeeAuthController.emailConfirm);
router.patch('/resend-confirmation', coffeeAuthController.resendEmailConfirmation);
router.use(coffeeAuthController.protect);
router.patch('/updateMyPassword', coffeeAuthController.updatePassword);
router.get('/me', authFactory.getMe, coffeeAuthController.getUser);
router.patch('/updateMe', providerController.updateMeProvider);
router.delete('/deleteMe', providerController.deleteMe);
router.use(coffeeAuthController.restrictTo('something-not-easy-to-guess'));
router.route('/test').get(coffeeAuthController.test);
exports.default = router;
//# sourceMappingURL=coffeeProvider.js.map