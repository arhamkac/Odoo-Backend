import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true, limit: "1mb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from './routes/user.routes.js'
import productRouter from './routes/product.routes.js'
import orderRouter from './routes/order.routes.js'
import cartRouter from './routes/cart.routes.js'

app.use('/api/users',userRouter)
app.use('/api/product',productRouter)
app.use('/api/order',orderRouter)
app.use('/api/cart',cartRouter)

export {app}