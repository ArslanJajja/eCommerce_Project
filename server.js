const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cloudinary = require('cloudinary');
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
require("dotenv").config({ path: "./config/config.env" });
const connectDB = require("./config/db");
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Connect to database.
connectDB();
// Cloudinary Configuration
cloudinary.config({ 
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
})
// Routes
app.get("/", (req, res, next) => {
  res.send("Wellcome to my Nodejs Ecommerce Api !");
});
app.use("/api/v1", userRoutes);
app.use("/api/v1",productRoutes);

const port = 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
