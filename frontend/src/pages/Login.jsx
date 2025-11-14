import React, { useState } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {toast} from 'react-toastify'

const Login = () => {

  const { backend_url, token, setToken } = useContext(AppContext)
  const [state, setState] = useState('Sign Up')

  const navigate=useNavigate();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {

      if (state === 'Sign Up') {
        const { data } = await axios.post(backend_url + '/api/user/register', { name, email, password })
        if (data.success) {
          setToken(data.token)
          localStorage.setItem('token', data.token);
        }
        else {
          toast.error(data.message)
        }

      }
      else {

        const { data } = await axios.post(backend_url + '/api/user/login', { email, password })
        if (data.success) {
          setToken(data.token)
          localStorage.setItem('token', data.token);
        }
        else {
          toast.error(data.message)
        }
      }


    }
    catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if(token){
      navigate('/')
    }
    
  }, [token])
  

  return (
    <div>
      <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
        <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-[96] border rounded-xl text-zinc-600 text-sm shadow-lg'>
          <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
          <p>Please {state === 'Sign Up' ? 'sign up' : 'login'} to book appointment</p>
          {
            state === 'Sign Up' && <div className='w-full'>
              <p>Full Name</p>
              <input className='border border-zinc-300 rounded w-full p-1 mt-1' type="text" onChange={(e) => setName(e.target.value)}  value={name} required />
            </div>
          }
          <div className='w-full'>
            <p>Email</p>
            <input className='border border-zinc-300 rounded w-full p-1 mt-1' type="text" onChange={(e) => setEmail(e.target.value)} value={email} required/>
          </div>
          <div className='w-full'>
            <p>Password</p>
            <input className='border border-zinc-300 rounded w-full p-1 mt-1' type="text" onChange={(e) => setPassword(e.target.value)} value={password} required />
          </div>
          <button type='submit' className='w-full bg-primary text-white rounded-md p-2 mt-2 text-base '>{state === 'Sign Up' ? 'Create Account' : 'login'}</button>
          {
            state === 'Sign Up'
              ? <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
              : <p>Create an new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>click here</span></p>
          }
        </div>
      </form>

    </div>
  )
}

export default Login
