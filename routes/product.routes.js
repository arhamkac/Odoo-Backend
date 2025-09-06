import {Router} from 'express'
import {verifyJWT} from '../middleware/auth.middleware.js'
import { createProduct, deleteProduct, getProductDetails, getProducts, updateProduct } from '../controllers/product.controller.js'
import { upload } from '../middleware/multer.middleware.js'

const router=Router()
router.route('/create').post(verifyJWT,upload.single("image"),createProduct)
router.route('/update/:id').patch(verifyJWT,updateProduct)
router.route('/delete/:id').delete(verifyJWT,deleteProduct)
router.route('/all').get(getProducts)
router.route('/:id').get(getProductDetails)

export default router