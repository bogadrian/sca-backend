import mongoose from 'mongoose';
import CoffeeProvider from './coffeeProviderModel';

const communitySchema: mongoose.Schema = new mongoose.Schema(
  {
    // created by the middlweare here down
    name: {
      type: String
    },
    // add its own handler
    photoCopertina: {
      type: String
    },
    // approved members
    members: [String],
    //request access - this is an ID pushed here by the user form community screen
    accessRequests: [String],
    // community admin handler
    blockedMembers: [String],
    // test this now with a provide id
    provider: [
      {
        type: (mongoose.Schema as any).ObjectId,
        ref: 'CoffeeProvider',
        required: [true, 'A communtiy must be created by a coffee provider']
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

communitySchema.pre('save', async function (next) {
  const prov: any = await CoffeeProvider.findById((this as any).provider);
  (this as any).name = `${prov.name}'s Community`;
  next();
});

// shoul populate the provider data into community
communitySchema.pre(/^find/, function (next) {
  (this as any).populate({
    path: 'provider',
    select: '-__v -emailConfirmToken -emailConfirm'
  });
  next();
});

const Community = mongoose.model('Community', communitySchema);

export default Community;
