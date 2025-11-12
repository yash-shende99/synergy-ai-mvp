import { createContext } from "react";
import { doctors } from '../assets/assets'
import axios from 'axios'
import { useState } from "react";
import {toast} from 'react-toastify'
import { useEffect } from "react";


export const AppContext=createContext()

const AppContextProvider=(props)=>{

    const [doctors,SetDoctors]=useState([])
    const [token,setToken]=useState(localStorage.getItem('token') ? localStorage.getItem('token'):'')
    const [userData,SetUserData]=useState(false)

    const currencySymbol='$';
    const backend_url=import.meta.env.VITE_BACKEND_URL
    const ml_url=import.meta.env.VITE_ML_URL




    const getDoctorsData=async()=>{
        try{
            const {data}=await axios.get(backend_url+'/api/doctor/list')
            if(data.success){
                SetDoctors(data.doctors)
                toast.success(data.message)
            }
            else{
                toast.error(data.message)
            }

        }
        catch(error){
            console.log(error.message)
            toast.error(error.message)

        }

    }

    const loadUserProfileData=async()=>{
        try{
            const {data}=await axios.get(backend_url+'/api/user/get-profile',{headers:{token}})

            if(data.success){
                SetUserData(data.userData)
            }
            else{
                toast.error(data.message)
            }

        }
        catch(error){
            console.log(error.message)
            toast.error(error.message)
        }
    }

    const value ={
        doctors,
        currencySymbol,
        backend_url,
        token,
        setToken,
        userData,
        SetUserData,
        loadUserProfileData,
        getDoctorsData,
        ml_url
    }

    useEffect(() => {
        getDoctorsData()
    }, [])

    useEffect(() => {
        if(token){
            loadUserProfileData()
        }
        else{
            SetUserData(false)
        }
      
    }, [token])

   
    return(
          <AppContext.Provider  value={value}>
                {props.children}
          </AppContext.Provider>
    ) 


}

export default AppContextProvider;