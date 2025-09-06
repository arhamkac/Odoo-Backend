import mongoose,{Schema} from "mongoose";

const productSchema=new Schema(
    {
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        category:{
            type: String,
            enum: [ "Clothing",
                    "Footwear",
                    "Accessories",
                    "Electronics",
                    "Mobile Phones",
                    "Laptops & Computers",
                    "Home Appliances",
                    "Furniture",
                    "Books",
                    "Stationery",
                    "Sports Equipment",
                    "Musical Instruments",
                    "Toys & Games",
                    "Baby Products",
                    "Health & Beauty",
                    "Bags & Luggage",
                    "Jewelry",
                    "Automobile Parts",
                    "Gardening",
                    "Other"],
            required:true
        },
        image:{
            type:String,
            required:true
        },
        sellerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    },{timestamps:true}
)

export const Product=mongoose.model("Product",productSchema)