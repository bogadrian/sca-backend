import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const coffeeProviderSchema: mongoose.Schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us the name of yours commercial activity!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  address: {
    type: String,
    required: [true, 'Please provide an activity address']
  },
  vat: {
    type: String,
    required: [true, 'We need your vat number']
  },
  images: {
    type: [String],
    default: ['default.jpg']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  description: {
    type: String,
    default: 'No description for me yet!'
  },
  slug: String,
  menuUrl: {
    type: String
  },
  s3MenuLink: {
    type: String
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
      // This only works on CREATE and SAVE!!!
      validator: function (el: string): boolean {
        return el === (this as any).password;
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
    coordinates: [Number]
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
    default: 'coffee-provider'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

coffeeProviderSchema.pre('save', function (next) {
  (this as any).slug = slugify((this as any).name, {
    lower: true
  });
  next();
});

coffeeProviderSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  (this as any).password = await bcrypt.hash((this as any).password, 12);

  // Delete passwordConfirm field
  (this as any).passwordConfirm = undefined;
  next();
});

coffeeProviderSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  (this as any).passwordChangedAt = Date.now() - 1000;
  next();
});

coffeeProviderSchema.pre(/^find/, function (next) {
  // this points to the current query
  (this as any).find({ active: { $ne: false } });
  next();
});

coffeeProviderSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

coffeeProviderSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: any
) {
  if (this.passwordChangedAt) {
    const changedTimestamp: number = parseInt(
      this.passwordChangedAt.getTime(),
      10
    );

    return JWTTimestamp < changedTimestamp / 1000;
  }

  // False means NOT changed
  return false;
};

coffeeProviderSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

coffeeProviderSchema.methods.createEmailConfirmToken = function () {
  const resetEmailToken = crypto.randomBytes(32).toString('hex');

  this.emailConfirmToken = crypto
    .createHash('sha256')
    .update(resetEmailToken)
    .digest('hex');

  return resetEmailToken;
};
coffeeProviderSchema.methods.createEmailConfirmToken = function () {
  const resetEmailToken = crypto.randomBytes(32).toString('hex');

  this.emailConfirmToken = crypto
    .createHash('sha256')
    .update(resetEmailToken)
    .digest('hex');

  return resetEmailToken;
};

coffeeProviderSchema.methods.correctEmailToken = async function (
  candidateToken: string,
  userToken: string
) {
  return await bcrypt.compare(candidateToken, userToken);
};

const CoffeeProvider = mongoose.model('CoffeProvider', coffeeProviderSchema);

export default CoffeeProvider;
