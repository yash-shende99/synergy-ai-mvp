import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
// import uploadOnCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'


const app=express()
const port=process.env.PORT || 4000

connectDB()


//middleware

app.use(express.json())
app.use(cors());
app.use(express.urlencoded({ extended: true }));


//api endpoint

app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)


app.get('/',(req,res)=>{
    res.send('API WORKING Great')
})


app.listen(port,()=>console.log('server running on port',port))



// minor update 2296

// minor update 8695
