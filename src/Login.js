import React from 'react'
import { useState,useEffect ,useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import store from 'store2'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const inp1 = useRef(null)
  const inp2 = useRef(null)
const [loading,setLoading]=useState(false)


useEffect(()=>{
  const checkAuthLogin=async()=>{
    const storedToken= await store.get('tokenTeacher')
    if (storedToken) {
      navigate('/main')
    }
  }
  checkAuthLogin()
},[])


const handleLogin=(e)=>{
  e.preventDefault()
setLoading(true)
   fetch('https://backendcrm-64wu.onrender.com/api/teacher/login',{
method:'POST',
headers:{
  'Content-Type':'application/json'
},
body:JSON.stringify({
  username:inp1.current.value,
  password:inp2.current.value
})
})
.then((res)=>res.json())
.then((data)=>{
  if (data.token) {
    setLoading(false)
    store.set('tokenTeacher',data.token)
    store.set('teacherName',inp1.current.value)
    navigate('/main')
}
})
.catch((err)=>{
  alert('Error',err.message)
  setLoading(false)
})
.finally(()=>setLoading(false))
}
  



  return (
    <div >
      <h1 className='h1'>Welcome , Log into you account</h1>
      <div className='cont'>

        <div className="f-cont">
          <p className='p1'>It is our great pleasure to have you on board! </p>
        </div>
        <form  onSubmit={handleLogin}>
          <input className='inp1' ref={inp1} placeholder='Enter the n of school' type="text" /><br /><br />
          <input className='inp1' ref={inp2} placeholder='Enter Password' type="password" /><br /><br />

          {loading==false ? <button>login</button>:<button>loading</button>}
        </form>
      </div>

    </div>
  )
}
