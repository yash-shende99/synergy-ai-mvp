import mongoose from "mongoose";
import doctorModel from "../models/doctorModel.js";
import validator from "validator"
import bcrypt from "bcrypt"
import {v2 as cloudinary} from "cloudinary"
import jwt from "jsonwebtoken"
import uploadOnCloudinary from '../config/cloudinary.js'
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";



  
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // Validate required fields
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        // Validate password length
        if (password.length < 8) { // Fixed typo: `lenght` -> `length`
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Upload image to Cloudinary
        const imageUpload = await uploadOnCloudinary(imageFile.path);
        if (!imageUpload || !imageUpload.secure_url) {
            return res.status(500).json({ success: false, message: "Failed to upload image" });
        }
        const imageUrl = imageUpload.secure_url;

        // Parse address if it's a JSON string
        let parsedAddress;
        try {
            parsedAddress = JSON.parse(address);
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid address format" });
        }

        // Create doctor data object
        const doctorData = {
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: parsedAddress,
            date: Date.now(),
        };

        // Save doctor to database
        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        // Return success response
        res.status(201).json({
            success: true,
            message: "Doctor added successfully",
            data: newDoctor,
        });

    } catch (error) {
        console.error(error.message); // Fixed typo: `error.meessage` -> `error.message`
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

const loginAdmin=async(req,res)=>{
    try{
        const {email,password}=req.body;

        console.log(email,password)

        if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
  

            const token=jwt.sign(email+password,process.env.JWT_SECRET)

            res.status(200).json({
                success:true,
                token
            })
               
        }
        else{
            res.status(404).json({
                success:false,
                message:"Invalid credientials"
            })
        }

    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


const allDoctors=async(req,res)=>{
    try{
      const doctors=await doctorModel.find({}).select('-password')
      res.status(200).json({success:true,doctors})
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}

const appointmentsAdmin=async(req,res)=>{
    try {
        const appointments=await appointmentModel.find({})
        res.status(200).json({
            success:true,
            appointments
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}


// API to make appointment cancelled 

const appointmentCancle=async(req,res)=>{
    
    try{
       const {appointmentId}=req.body;

       const appointmentData=await appointmentModel.findById(appointmentId)

       
       await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

       // releasing doctor slot

       const {docId,slotDate,slotTime}=appointmentData

       const doctorData=await doctorModel.findById(docId)

       let slots_booked=doctorData.slots_booked
       
       slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime)

       await doctorModel.findByIdAndUpdate(docId,{slots_booked})
       

       res.status(200).json({
        success:true,
        message:'Appointment Cancelled'
       })



    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message,
        })


    }

}

// API to get the dashboard data

const adminDashboard=async(req,res)=>{
    try {
        const doctors=await doctorModel.find({})
        const users=await userModel.find({})
        const appointments=await appointmentModel.find({})

        const dashData={
            doctors:doctors.length,
            appointments:appointments.length,
            patients:users.length,
            latestAppointments:appointments.reverse().slice(0,5)
        }

        res.status(200).json({
            success:true,
            dashData
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


export {addDoctor,loginAdmin,allDoctors,appointmentsAdmin,appointmentCancle,adminDashboard}

// minor update 4428

// minor update 8763
