import mongoose,{Schema} from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        profileImage:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        refreshToken:{
            type:String
        },
        otpVerified:{
            type:Boolean,
            default:false
        }
    },
    {timestamps:true}
)

userSchema.methods.isPasswordCorrect=async function (password) {
    return await bcrypt.compare(password,this.password); 
}

userSchema.pre("save",async function(next){
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    next();
})

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this.id,
            username:this.username,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this.id
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema)