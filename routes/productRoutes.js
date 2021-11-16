const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createProduct,
  fetchProducts,
  fetchProductDetails,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
} = require("../controllers/productController");

router.route("/product/new").post(protect, authorize("admin"), createProduct);
router.route("/products").get(fetchProducts);
router.route("/product/:id").get(fetchProductDetails);
router
  .route("/admin/product/:id")
  .put(protect, authorize("admin"), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);
router.route("/review").put(protect, createProductReview);
router
  .route("/reviews")
  .get(protect, getProductReviews)
  .delete(protect, deleteReview);
module.exports = router;
