import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js";


const getChangeAvailablity=async(req,res)=>{
    try{
      const {docId}=req.body
      const docData=await doctorModel.findById(docId)
      await doctorModel.findByIdAndUpdate(docId,{available:!docData.available})
      res.status(200).json({success:true,message:'Availablity Changed'})
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}

const doctorList=async(req,res)=>{
    try{
        const doctors=await doctorModel.find({}).select(['-password','-email'])
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

const loginDoctor=async(req,res)=>{
    try {
        const {email,password}=req.body

        const doctor=await doctorModel.findOne({email})

        if(!doctor){
            return res.status(404).json({
                success:false,
                message:"Invalid credientials"

            })
        }

        const isMatch=await bcrypt.compare(password,doctor.password)

        if(isMatch){
            const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET)
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


    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}

// API to get the doctor Appointments


const appointmentsDoctor=async(req,res)=>{
    try {
        const {docId}=req.body

        const appointments=await appointmentModel.find({docId})

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

//API to mark appointment completed for doctor panel 

const appointmentComplete =async(req,res)=>{
    try {
        const {docId,appointmentId}=req.body

        const appointmentData=await appointmentModel.findById(appointmentId)

        if(appointmentData && appointmentData.docId===docId){
             
            await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true})

            return res.status(200).json({
                success:true,
                message:'Appointment Completed'
            })

        }
        else{
            return res.status(404).json({
                success:false,
                message:'Mark Failed'
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


//API to mark appointment Cancelled for doctor panel 

const appointmentCancle =async(req,res)=>{
    try {
        const {docId,appointmentId}=req.body

        const appointmentData=await appointmentModel.findById(appointmentId)

        if(appointmentData && appointmentData.docId===docId){
             
            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

            return res.status(200).json({
                success:true,
                message:'Appointment Cancelled'
            })

        }
        else{
            return res.status(404).json({
                success:false,
                message:'Cancellation Failed'
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


// API to make doctor Dashboard 

const doctorDashboard=async(req,res)=>{
    try {
        const {docId}=req.body

        const appointments= await appointmentModel.find({docId})
        
        let earnings=0

        appointments.map((item)=>{
            earnings+=item.amount
        })

        let patients=[]

        appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })

        const dashData={
            earnings,
            patients:patients.length,
            appointments:appointments.length,
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
            message:error.message
        })
    }
}

// API to get Doctor Data from doctor panel
const doctorProfile=async(req,res)=>{
    try {
        const {docId}=req.body

        const profileData=await doctorModel.findById(docId).select("-password")

        res.status(200).json({
            success:true,
            profileData
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//API to update doctor Profile data from Doctor panel

const updateDoctorProfile=async(req,res)=>{
    try {

        const {docId,fees,address,available}=req.body

        await doctorModel.findByIdAndUpdate(docId,{fees,address,available})

        res.status(200).json({
            success:true,
            message:'Profile Updated'
        })

        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export {getChangeAvailablity,doctorList,loginDoctor,appointmentsDoctor,appointmentComplete,appointmentCancle,doctorDashboard,doctorProfile,updateDoctorProfile}