import axios from "axios"
import {createContext, useState } from "react"
import { toast } from "react-toastify"

export const AdminContext=createContext()

const AdminContextProvider=(props)=>{

    const [aToken, setAToken] = useState(localStorage.getItem('aToken')?localStorage.getItem('aToken'):'')

    const backend_url=import.meta.env.VITE_BACKEND_URL

    const [doctors,SetDoctors]=useState([])

    const [appointment,setAppointment]=useState([])

    const [dashData,setdashData]=useState(false)

    const getAllDoctors=async()=>{
      try{

        const {data}=await axios.post(backend_url+'/api/admin/all-doctors',{},{headers:{aToken}})

        if(data.success){
          SetDoctors(data.doctors) 
        }
        else{
          toast.error(data.message)

        }

      }
      catch(error){
         toast.error(error.message)
      }

    }

    const changeAvailablity=async(docId)=>{
        try{
    
          const {data}=await axios.post(backend_url+'/api/admin/change-availablity',{docId},{headers:{aToken}})
    
          if(data.success){
             toast.success(data.message)
             getAllDoctors();
          }
          else{
            toast.error(data.message)
          }
    
        }
        catch(error){
          toast.error(error.message)
        }
    
    
      }

      const getAllappointments=async()=>{
        try {
          const {data}=await axios.get(backend_url+'/api/admin/appointments',{headers:{aToken}})

          if(data.success){
            setAppointment(data.appointments)
          }
          else{
            toast.error(data.message)
          }
          
        } catch (error) {
          toast.error(error.message)
        }
      }


      const cancleAppointment=async(appointmentId)=>{
        try {
          const {data}=await axios.post(backend_url+'/api/admin/cancle-appointment',{appointmentId},{headers:{aToken}})

          if(data.success){
             toast.success(data.message)
             getAllappointments()
             getDashData()

          }
          else{
            toast.error(data.message)
          }
          
        } catch (error) {
          toast.error(error.message)
        }
      }

      const getDashData=async()=>{
        try {
          const {data}=await axios.get(backend_url+'/api/admin/dashboard',{headers:{aToken}})

          if(data.success){
            setdashData(data.dashData)
           
          }
          else{
            toast.error(data.message)
          }
        } catch (error) {
          toast.error(error.message)
          
        }
      }

    const value={
        aToken,
        setAToken,
        backend_url,
        doctors,
        getAllDoctors,
        changeAvailablity,
        getAllappointments,
        appointment,
        setAppointment,
        cancleAppointment,
        dashData,
        getDashData,

    }

    return (
      <AdminContext.Provider value={value}>
        {props.children}

      </AdminContext.Provider>
    )



}

export default AdminContextProvider