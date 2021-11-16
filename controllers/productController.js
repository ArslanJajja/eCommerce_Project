const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const Product = require("../models/productModal");
const sendToken = require("../utils/sendToken");

// Create Product
exports.createProduct = asyncHandler(async (req, res, next) => {
  //   let images = [];
  //   if (typeof req.body.images === "string") {
  //     images.push(req.body.images);
  //   } else {
  //     images = req.body.images;
  //   }
  //   const imagesLink = [];
  //   for (let i = 0; i < images.length; i++) {
  //     const result = await cloudinary.v2.uploader.upload(images[i], {
  //       folder: "products",
  //     });
  //     imagesLink.push({
  //       public_id: result.public_id,
  //       url: result.secure_url,
  //     });
  //   }

  //   req.body.images = imagesLink;
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// Get all products
exports.fetchProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({ success: true, products });
});
// Get Product Details
exports.fetchProductDetails = asyncHandler(async (req, res, next) => {
  const product = await Product.find(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({ success: true, product });
});
// Update Product
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.find(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  // let images = [];
  // if (req.body.images === "string") {
  //   images.push(req.body.images);
  // } else {
  //   images = req.body.images;
  // }
  // if (images !== undefined) {
  //   for (let i = 0; i < product.images.length; i++) {
  //     await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  //   }
  //   const imagesLink = [];
  //   for (let i = 0; i < images.length; i++) {
  //     const result = await cloudinary.v2.uploader.upload(images[i], {
  //       folder: "products",
  //     });
  //     imagesLink.push({
  //       public_id: result.public_id,
  //       url: result.secure_url,
  //     });
  //   }
  //   req.body.images = imagesLink;
  // }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidation: true,
    useFindAndModify: false,
  });
  res.status(200).json({ success: true, product });
});
// Delete Product
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.find(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  // for(let i = 0; i < product.images.length; i++){
  //   await cloudinary.v2.uploader.destroy(product.images[i].public_id)
  // }

  await product.remove();
  res
    .status(200)
    .json({ success: true, message: "Product deleted successfully" });
});
// Create and Update a review
exports.createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const reviewData = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(reviewData);
    product.numOfReviews = product.reviews.length;
  }
  let average = 0;
  product.reviews.forEach((review) => {
    average += review.rating;
  });
  product.ratings = average / product.reviews.length;
  await product.save({ validateBeforeSave: false });
  res.status(200).json({ success: true });
});
// Get all reviews of the product
exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const product = await Product.find(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({ success: true, reviews: product.reviews });
});
// Delete a review
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const product = await Product.find(req.query.productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  const reviews = product.reviews.filter((rev) => {
    rev._id.toString() !== req.query.id.toString();
  });
  let average = 0;
  product.ratings.forEach((review) => {
    average += review.ratings;
  });
  let ratings = 0;
  if (review.ratings.length === 0) {
    ratings = 0;
  } else {
    ratings = average / review.ratings.length;
  }
  const numOfReviews = reviews.length;
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    { new: true, runValidators: true, useFindAndModify: false }
  );
  res
    .status(200)
    .json({ success: true, message: "Review deleted successfully!" });
});
