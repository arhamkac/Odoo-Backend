import mongoose,{Schema} from "mongoose";

const otpSchema=new Schema(
    {
        otp:{
            type:Number,
            length:6,
            required:true
        },
        otpExpiry:{
            type:Date
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    }
)

export const OTP=mongoose.model(OTP,otpSchema)