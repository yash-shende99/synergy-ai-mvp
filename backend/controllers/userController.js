import userModel from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'
import validator from "validator"
import uploadOnCloudinary from '../config/cloudinary.js'


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing details' })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'enter a valid email' })
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Enter a strong password' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }
        const newUser = new userModel(userData)

        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.status(200).json({
            success: true,
            token
        })


    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            messsage: error.message
        })

    }

}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

       
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email",
            });
        }

       
        const user = await userModel.findOne({ email }).select('+password'); 
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' }); 

       
        res.status(200).json({
            success: true,
            token
        });

    } catch (error) {
        console.error(error); 
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};


const getProfile = async (req, res) => {
    try {
        const { userId } = req.body

        const userData = await userModel.findById(userId).select('-password')

        res.status(200).json({
            success: true,
            userData
        })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })

    }

}

const updateProfile = async (req, res) => {
    try {

        const { userId, name, phone, address, gender, dob } = req.body;
        const imageFile = req.file

        console.log("imagefile", imageFile)

        if (!name || !phone || !gender || !dob) {
            return res.status(400).json({
                success: false,
                message: 'Missing Details'
            })
        }

        await userModel.findOneAndUpdate(
            { _id: userId },
            { name, phone, gender, dob, address: JSON.parse(address) }
        );



        if (imageFile) {
            const imageUpload = await uploadOnCloudinary(imageFile.path);
            const imageURL = imageUpload.secure_url
            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.status(200).json({
            success: true,
            message: 'Profile Updated'
        })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })


    }

}

//API for book Appointment 
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotTime, slotDate } = req.body;

        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            res.status(400).json({
                success: false,
                message: 'Doctor not available'
            })
        }

        //copy of slots_booked from doctor data
        let slots_booked = docData.slots_booked
        // checking for slot availabilty

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.status(400).json({
                    success: false,
                    message: 'Slot not available'
                })
            }
            else {
                slots_booked[slotDate].push(slotTime)

            }

        }
        else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }


        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now(),
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        //save updated slot of data in doctor data

        await doctorModel.findByIdAndUpdate({ _id: docId }, { slots_booked })

        res.status(200).json({
            success: true,
            message: 'Appointment Booked '
        })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })

    }
}

//API  to get the booked appoinments of user in  frontend

const listAppoinment = async (req, res) => {
    try {
        const { userId } = req.body;

        const appointments = await appointmentModel.find({ userId })

        res.status(200).json({
            success: true,
            appointments
        })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })

    }
}


const cancleAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId)

        //verify user

        if (userId !== appointmentData.userId) {
            return res.status(404).json({
                success: false,
                message: 'Unautorized action'
            })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot

        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })


        res.status(200).json({
            success: true,
            message: 'Appointment Cancelled'
        })



    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })


    }

}

// API to make payment of Appointment using razorpay


const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET

})

//make the payment for an appointment

const payementRazorpay = async (req, res) => {

    try {
        const { appointmentId } = req.body



        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.status(404).json({
                success: false,
                message: 'Appointment Cancelled or not found'
            })

        }

        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId
        }

        const order = await razorpayInstance.orders.create(options)

        res.status(200).json({
            success: true,
            order
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })

    }


}


const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body



        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)


        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.status(200).json({
                success: true,
                message: "Payement Successful"
            })
        }
        else {
            res.status(404).json({
                success: false,
                message: "Payement failed"
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })

    }

}







export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppoinment, cancleAppointment, payementRazorpay, verifyPayment }
// minor update 6502

// minor update 1864
