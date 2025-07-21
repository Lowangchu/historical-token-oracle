import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      lowercase: true, // ensure addresses are case-insensitive
      trim: true
    },
    network: {
      type: String,
      required: true,
      enum: ['ethereum', 'polygon'], // optional: restrict to valid networks
      lowercase: true
    },
    timestamp: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

// Prevent duplicate prices for same token-network-timestamp
priceSchema.index({ token: 1, network: 1, timestamp: 1 }, { unique: true });

const Price = mongoose.model('Price', priceSchema);

export default Price;
