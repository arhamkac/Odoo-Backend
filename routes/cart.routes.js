import {Router} from 'express'
import {verifyJWT} from '../middleware/auth.middleware.js'
import { addToCart, clearCart, getCart, removeFromCart } from '../controllers/cart.controller.js'

const router=Router()
router.route()
router.route("/").get(verifyJWT,getCart)
router.route("/add").post(verifyJWT,addToCart)
router.route("/remove/:productId").post(verifyJWT,removeFromCart)
router.route("/clear").delete(verifyJWT,clearCart)

export default router