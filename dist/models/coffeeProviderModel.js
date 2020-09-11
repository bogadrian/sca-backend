"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const coffeeProviderSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us the name of yours commercial activity!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator_1.default.isEmail, 'Please provide a valid email']
    },
    address: {
        type: String,
        required: [true, 'Please provide an activity address']
    },
    vat: {
        type: String,
        required: [true, 'We need your vat number']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    position: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
    },
    passwordChangedAt: Date,
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    emailConfirmToken: String,
    emailConfirm: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'coffee-provider',
        select: true
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});
coffeeProviderSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});
coffeeProviderSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew)
        return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});
coffeeProviderSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});
coffeeProviderSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcryptjs_1.default.compare(candidatePassword, userPassword);
};
coffeeProviderSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime(), 10);
        return JWTTimestamp < changedTimestamp / 1000;
    }
    return false;
};
coffeeProviderSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
coffeeProviderSchema.methods.createEmailConfirmToken = function () {
    const resetEmailToken = crypto_1.default.randomBytes(32).toString('hex');
    this.emailConfirmToken = crypto_1.default
        .createHash('sha256')
        .update(resetEmailToken)
        .digest('hex');
    return resetEmailToken;
};
coffeeProviderSchema.methods.createEmailConfirmToken = function () {
    const resetEmailToken = crypto_1.default.randomBytes(32).toString('hex');
    this.emailConfirmToken = crypto_1.default
        .createHash('sha256')
        .update(resetEmailToken)
        .digest('hex');
    return resetEmailToken;
};
coffeeProviderSchema.methods.correctEmailToken = async function (candidateToken, userToken) {
    return await bcryptjs_1.default.compare(candidateToken, userToken);
};
const CoffeeProvider = mongoose_1.default.model('CoffeProvider', coffeeProviderSchema);
exports.default = CoffeeProvider;
//# sourceMappingURL=coffeeProviderModel.js.map