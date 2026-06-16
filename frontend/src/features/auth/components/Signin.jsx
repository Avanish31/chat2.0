import React from 'react'
import Container from '../../../partials/Container'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import {Signinfn} from '../services/Siginin'
import { useDispatch } from 'react-redux'
import { login } from '../state/authSlice'
import {useNavigate} from "react-router-dom"
function Signin() {
  const {register,handleSubmit,reset}=useForm();
  const[error , setError]=useState("")
  const dispatch=useDispatch();
  const navigate=useNavigate()
  const onSubmit=(data)=>{
    Signinfn(data,setError,reset,dispatch,login,navigate);
  }
  return (
    <Container>
    <div className='flex flex-col font-bold justify-center items-center text-black min-w-[40%] font-oswald shadow-[5px_5px_5px_grey] bg-white rounded-[10px] p-[2em]'>
                <h2 className='text-2xl'>Signin</h2>
                <form onSubmit={handleSubmit(onSubmit)}className='flex flex-col gap-[1.25rem] text-[1.5rem] w-[100%]'>  
                    <div className="mb-0">
                        <label className="form-label" >Email address</label>
                        <input {...register("email")} required type="email" className="form-control " id="exampleInputEmail1" aria-describedby="emailHelp" name="email" style={{"border": "2px solid yellowgreen"}}/>
                    </div>
                    <div className="mb-3">
                        <label  className="form-label">Password</label>
                        <input {...register("password")} required type="password" className="form-control " id="exampleInputPassword1" name="password" style={{"border": "2px solid yellowgreen"}}/>
                        {error && <p className='text-red-600  text-center'>{error}</p>}
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
    </div>
    </Container>
  )
}

export default Signin