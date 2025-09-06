import {Router} from 'express'
import {verifyJWT} from '../middleware/auth.middleware.js'
import { placeOrder,getMyOrders,getOrderDetails } from '../controllers/order.controller.js';

const router=Router()
router.route("/place").post(verifyJWT, placeOrder);
router.route("/my-orders").get(verifyJWT, getMyOrders);
router.route("/:id").get(verifyJWT, getOrderDetails);

export default router