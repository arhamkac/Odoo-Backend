import mongoose,{Schema} from "mongoose";

const cartSchema=new Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, default: 1, min: 1 }
        }
        ]
    }
)

export const Cart=mongoose.model("Cart",cartSchema)