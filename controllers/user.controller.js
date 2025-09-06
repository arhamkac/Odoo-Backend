import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import dns from "dns/promises"
import { User } from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {otpSender,generateOTP} from '../middleware/otp.middleware.js'
import validator from 'validator'
import {ApiResponse} from '../utils/ApiResponse.js'

async function verifyEmailBeforeOtp(email) {
  if (!validator.isEmail(email)) {
    return { valid: false, reason: "Invalid email format" };
  }

  const domain = email.split("@")[1];

  try {
    const addresses = await dns.resolveMx(domain);

    if (!addresses || addresses.length === 0) {
      return { valid: false, reason: "Email domain cannot receive mail" };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, reason: "Email domain cannot receive mail" };
  }
}

const generateAccessAndRefreshToken=async(userId)=>{
  try {
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})
  
    return {accessToken,refreshToken}

  } catch (error) {
    throw new ApiError(500,"Error in generating access and refresh token",error)
  }
}

const registerUser=asyncHandler(async(req,res)=>{
    const {username,password,email}=req.body
    if([username,password,email].some((field)=>field.trim()==="")){
        throw new ApiError(400,"All fields are required to continue")
    }
    
    const emailCheck=await verifyEmailBeforeOtp(email)
    if(!emailCheck.valid){
        throw new ApiError(400,"This email is not valid")
    }

    const userExists=await User.findOne({email:email})
    if(userExists){
        throw new ApiError(400,"User with this email alredy exists")
    }

    const localFilePath=req.file?.path
    if(!localFilePath){
      throw new ApiError(400,"Image cannot be uploaded with this path")
    }
    const image=await uploadOnCloudinary(localFilePath)
    if(!image){
        throw new ApiError(500,"Error in uploading images on cloudinary")
    }

    const user=await User.create({
        email,
        username,
        password,
        profileImage:image.url
    })
    if(!user){
        throw new ApiError(500,"Error in creating user")
    }


    const createdUser=await User.findById(user._id).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,createdUser,"User created successfully")
    )
})

const loginUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body
    if([email,password].some((field)=>field.trim()==="")){
      throw new ApiError(400,"Email and password are required to login")
    }

    const user = await User.findOne({ email }).select("+password");
    if(!user){
     throw new ApiError(401, "Invalid email or password");
    }

    const passCheck=await user.isPasswordCorrect(password)
    if(!passCheck){
      throw new ApiError(400,"Password entered is incorrect")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    const options={
      httpOnly:true,
      sameSite:"lax",
      secure:false
    }

    const loggedUser=await User.findById(user._id).select("-password")
    
    return res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(
      new ApiResponse(200,{user:loggedUser,accessToken,refreshToken},"User logged in successfully")
    )
})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        sameSite:"lax"
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            sameSite:"lax"
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const getUserProfile=asyncHandler(async(req,res)=>{
  const userId=req.user?._id
  const userProfile=await User.findById(userId).select("-password -refreshToken")
  
  return res
  .status(200)
  .json(
    new ApiResponse(200,userProfile,"User profile fetched successfully")
  )
})

const updateUserProfile=asyncHandler(async(req,res)=>{
  const {username,email,password}=req.body

  const user=await User.findById(req.user?._id)
  if (username){user.username = username;}
  if (email){user.email = email;}
  if (password){user.password=password;}

  const updatedUser=await user.save();
  if(!updatedUser){
    throw new ApiError(400,"There was some error in updating details")
  }
  const userNew=await User.findById(updatedUser._id).select("-password -refreshToken")

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      userNew,
      "User profile updated successfully"
    )
  );

})

export {generateAccessAndRefreshToken,registerUser,loginUser,logoutUser,refreshAccessToken,getUserProfile,updateUserProfile}