import {Router} from 'express'
import {verifyJWT} from '../middleware/auth.middleware.js'
import { getUserProfile, loginUser, logoutUser, registerUser, updateUserProfile } from '../controllers/user.controller.js'
import {upload} from '../middleware/multer.middleware.js'

const router=Router()
router.route('/register').post(upload.single("profileImage"),registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT,logoutUser)
router.route('/me').get(verifyJWT,getUserProfile)
router.route('/refrehToken').post(verifyJWT)
router.route('/me/update').patch(verifyJWT,updateUserProfile)

export default router