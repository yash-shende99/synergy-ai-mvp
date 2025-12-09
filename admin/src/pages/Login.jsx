import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast} from 'react-toastify'
import { DoctorContext } from '../context/DoctorContext'



const Login = () => {

  const [state,setState]=useState('Admin')

  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')

  const {backend_url,setAToken}=useContext(AdminContext)
  const {setDToken}=useContext(DoctorContext)
  

  const onSubmitHandler=async(event)=>{
    event.preventDefault()
    try {
        if(state==='Admin'){
         const {data}= await axios.post(backend_url+'/api/admin/login',{email,password})
        
         if(data.success){
          localStorage.setItem('aToken',data.token)
          setAToken(data.token)
         }
         else{
           toast.error(data.message)
         }
      }
      else{
        const {data}= await axios.post(backend_url+'/api/doctor/login',{email,password})
        
        if(data.success){
         localStorage.setItem('dToken',data.token)
         setDToken(data.token)
        }
        else{
          toast.error(data.message)
        }

      }

      
    } catch (error) {
      console.log(error.message)
      toast.error(error.message)
      
    }

  }



  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col items-start gap-3 p-8 m-auto min-w-[340px] sm:min-w-96 border border-[#DADADA] rounded-xl text-[#5E5E5E] text-sm shadow-lg'> 
        <p className='text-2xl font-semibold m-auto'><span className='text-primary'>{state} </span>Login</p>
        <div className='w-full'>
          <p>Email</p>
          <input onChange={(e)=>setEmail(e.target.value)} value={email} className='border border-[#DADADA] w-full mt-1 p-2 rounded ' type="text" required/>
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input onChange={(e)=>setPassword(e.target.value)} value={password}  className='border border-[#DADADA] w-full mt-1 p-2 rounded ' type="password" required/>
        </div>
        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
         {
          state==='Admin'
          ? <p>Doctor Login? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Doctor')}>Click here</span></p>
          : <p>Admin Login? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Admin')}>Click here</span></p>
          
         }
      </div>
    </form>
  )
}

export default Login
