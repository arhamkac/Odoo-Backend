import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose from "mongoose";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId", "title price image category");
  res.status(200).json(new ApiResponse(200, cart || { items: [] }, "Cart fetched successfully"));
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId,quantity }=req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) throw new ApiError(400, "Invalid product ID");
  if (!quantity || quantity < 1) throw new ApiError(400, "Quantity must be at least 1");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = await Cart.create({ userId: req.user._id, items: [{ productId, quantity }] });
  } else {
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity; // update quantity
    } else {
      cart.items.push({ productId, quantity }); // add new product
    }
    await cart.save();
  }

  res.status(200).json(new ApiResponse(200, cart, "Cart updated successfully"));
});


export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) throw new ApiError(400, "Invalid product ID");

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter(item => item.productId.toString() !== productId);
  await cart.save();

  res.status(200).json(new ApiResponse(200, cart, "Product removed from cart"));
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndDelete({ userId: req.user._id });
  res.status(200).json(new ApiResponse(200, {}, "Cart cleared successfully"));
});
