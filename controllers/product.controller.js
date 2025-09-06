import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { Product } from '../models/product.model.js';

const createProduct = asyncHandler(async (req, res) => {
  const { title, description, category, price } = req.body;

  if (![title, description, category, price].every(Boolean)) {
    throw new ApiError(400, "All fields are required to create a product");
  }

  const localFilePath = req.file?.path;
  if (!localFilePath) throw new ApiError(400, "Product image is required");

  const image = await uploadOnCloudinary(localFilePath);
  if (!image) throw new ApiError(500, "Error uploading product image");

  const product = await Product.create({
    title,
    description,
    category,
    price,
    image: image.url,
    sellerId: req.user._id 
  });

  res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

const getProducts = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, category, search, sortBy, sortOrder } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);
  sortOrder = sortOrder === "desc" ? -1 : 1;

  const pipeline = [];
  const countPipeline = [];

  const match = {};
  if (category) match.category = category;
  if (search) match.title = { $regex: search, $options: "i" };

  if (Object.keys(match).length) {
    pipeline.push({ $match: match });
    countPipeline.push({ $match: match });
  }

  // Sort stage
  const sort = {};
  sort[sortBy || "createdAt"] = sortOrder;
  pipeline.push({ $sort: sort });

  // Pagination
  const skip = (page - 1) * limit;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // Project only necessary fields
  pipeline.push({
    $project: {
      title: 1,
      price: 1,
      category: 1,
      image: 1,
      createdAt: 1
    }
  });

  // Execute aggregation
  const products = await Product.aggregate(pipeline);

  // Execute count aggregation for total
  const totalArr = await Product.aggregate([...countPipeline, { $count: "total" }]);
  const total = totalArr[0]?.total || 0;

  res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, "Products fetched successfully")
  );
});


const getProductDetails = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw new ApiError(404, "Product not found");

  res.status(200).json(new ApiResponse(200, product, "Product details fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.sellerId.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not authorized to update this product");

  const { title, description, category, price } = req.body;
  if (title) product.title = title;
  if (description) product.description = description;
  if (category) product.category = category;
  if (price) product.price = price;

  if (req.file?.path) {
    const image = await uploadOnCloudinary(req.file.path);
    product.image = image.url;
  }

  await product.save();
  res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.sellerId.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not authorized to delete this product");

  await product.deleteOne();
  res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});

export {createProduct,deleteProduct,updateProduct,getProducts,getProductDetails}


