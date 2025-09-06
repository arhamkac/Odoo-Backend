import mongoose,{Schema} from "mongoose";

const orderSchema=new Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        items:[
            {
            productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
            },
            quantity:{
                type:Number,
                default:1,
                min:1
            }
            ,price:{
                type:Number,
                required:true
            }
            }
        ],
        totalPrice: { type: Number, required: true },
        purchasedAt: { type: Date, default: Date.now }
    }
)

export const Order=mongoose.model("Order",orderSchema)