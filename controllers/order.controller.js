import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose from "mongoose";

export const placeOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId", "price title");
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty");

  let totalPrice = 0;
  const items = cart.items.map(item => {
    totalPrice += item.quantity * item.productId.price;
    return {
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price
    };
  });

  const order = await Order.create({
    userId: req.user._id,
    items,
    totalPrice
  });

  await Cart.findOneAndDelete({ userId: req.user._id });

  res.status(201).json(new ApiResponse(201, order, "Order placed successfully"));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).populate("items.productId", "title price image category");
  res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

export const getOrderDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid order ID");

  const order = await Order.findById(id).populate("items.productId", "title price image category");
  if (!order) throw new ApiError(404, "Order not found");

  res.status(200).json(new ApiResponse(200, order, "Order details fetched successfully"));
});
