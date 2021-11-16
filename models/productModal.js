const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a product name !"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter a product description"],
  },
  brand: {
    type: String,
    required: [true, "Please enter a product brand"],
  },
  category: {
    type: String,
    required: [true, "Please enter a product category"],
  },
  price: {
    type: Number,
    required: [true, "Please enter a product price"],
    maxLength: [8, "Price cannot exceed 8 characters"],
  },
  images: [
    {
      public_id: { type: String },
      url: { type: String },
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    required: [true, "Please enter a product stock"],
    maxLength: [4, "Stock cannot exceed 4 characters"],
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default:Date.now(),
  },
});
module.exports = mongoose.model("Product", productSchema);
