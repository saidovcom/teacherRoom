import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import store from 'store2';
import moment from 'moment';
import './Main.css';
import profile from './icons/proifle.webp';
import bear from './icons/sleepbear.png';
import Modal from './Modal';

export default function GroupSt() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [checkboxStates, setCheckboxStates] = useState({});
  const [modal, setModal] = useState(false);
  const [count, setCount] = useState(0);
  const location = useLocation();
  const [yuqlamas,setYuqlamas]=useState([])
  const [yuqlamaId,setYuqlamaId]=useState(null)
  const reason=useRef(null)
const [renameYuqlama,setRenameYuqlama]=useState({})
const [reasonInputs,setReasonInputs]=useState({})
const  [reasonValue,setReasonValue]=useState({})
const [hisobData,seTHisobData]=useState([])
  const { group, date } = location.state || {};
  const [style,setStyle]=useState({
    backgroundColor:'red'
  })

  const fetchTeacher = useCallback(async () => {
    try {
      const res = await fetch('https://backendcrm-64wu.onrender.com/api/get/students', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data) {
        setTeachers(data);
      }
    } catch (err) {
      alert(`Xatolik: ${err.message}`);
    }
  }, []);
  const getYuqlamas=async()=>{
  try{
    const res =await fetch('https://backendcrm-64wu.onrender.com/api/get/yuqlama',{
      method:'GET',
      headers:{
        'Content-Type':'application/json'
      }
    })
    const result= await res.json()
    if (result) {
      // alert(result.message)
      setYuqlamas(result)
      
    }else{
      console.log('malumot yuq');
    }
  }catch(err){
    console.log(err.message);
  }
  
}


const getHisobOfStudents=async()=>{
  try{
    const res =await fetch('https://backendcrm-64wu.onrender.com/api/get/payment',{
      method:'GET',
      headers:{
        'Content-Type':'application/json'
      }
    })
    const data=await res.json()
    if (data) {
      seTHisobData(data)
      
    }

  }catch(err){
    console.log(err);
  }
}


  useEffect(() => {
    fetchTeacher();
    getYuqlamas()
    getHisobOfStudents()
  }, [fetchTeacher]);

  const filteredData = group ? teachers.filter((item) => item.studentGroup === group || item.group === group || item.group2 === group) : [];
const filtiredYuqlama=group ? yuqlamas.filter((item)=>item.group==group && new Date(new Date(item.date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]==new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]):[]
const filtredHisob=group? hisobData.filter((h)=>h.group== group && filteredData.some((s)=>s.username==h.username)):[]
console.log(filtredHisob);

console.log(yuqlamas);

useEffect(() => {
    setCount(filteredData.length);
  }, [teachers, filteredData]);



  useEffect(()=>{
  if (modal) {
    const intialStates={}
    const intialInputs={}
    filteredData.forEach((i)=>{
      intialStates[i.fullName]=true
      intialInputs[i.fullName]=''
    })
    setCheckboxStates(intialStates)
    setReasonInputs(intialInputs)
  }
},[modal])

  const open = () => {
    setModal(true);
  };

  const close = () => {
    setModal(false);
  };

  const handleCheckboxChange = (event, fullName) => {
    const isChecked =event.target.checked
    setCheckboxStates(prev => ({
      ...prev,
      [fullName]: event.target.checked
    }));
    if (isChecked) {
      setReasonInputs(prev=>({
        ...prev,[fullName]:''
      }))
      
    }
  };

  const handleReasonInputChange=(event,fullname)=>{
    setReasonInputs(prev=>({
      ...prev,
      [fullname]:event.target.value
    }))
  }
  const handleCheckboxChange1 = (event, fullName) => {
    setRenameYuqlama(prev => ({
      ...prev,
      [fullName]: event.target.checked
    }));
    setYuqlamaId(fullName)
  };

  const handleSubmit = async () => {

    for (const item of filteredData) {
      const checkedStatus=checkboxStates[item.fullName] || false
      const reasonText=! checkedStatus? (reasonInputs[item.fullName]==='reason'?'Sababli':null):null
      const data = {
        fullname: item.fullName,
        username: item.username,
        phone:item.addedBy,
        group: group,
        date: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        checked: checkboxStates[item.fullName] ||  false,
        reason:reasonText
      }

      try {
        const res = await fetch('https://backendcrm-64wu.onrender.com/api/send/yuqlama', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        console.log('yuborildi', result.message);
        getYuqlamas()
      } catch (err) {
        console.log('xatolik:', err.message);
      }
    }
    

    try {
      const currentSentAttendance = store.get('sentAttendance') || {};
      const formattedDate = moment(new Date(date)).format('YYYY-MM-DD');
      const attendanceKey = `${group}_${formattedDate}`;

      currentSentAttendance[attendanceKey] = true;

      store.set('sentAttendance', currentSentAttendance);
      console.log('store2 ga yo\'qlama holati saqlandi:', currentSentAttendance);

      alert('Muvaffaqiyatli yuborildi!');
    } catch (error) {
      console.error("store2 da yo'qlama holatini yangilashda xato:", error);
      alert('Xatolik yuz berdi!');
    }

    setModal(false);
  };


  const handleRenameYuqlama =async()=>{
    const selectedvalue=reasonValue[yuqlamaId]
    
    if (selectedvalue==undefined) {
      try{
      const res =await fetch(`https://backendcrm-64wu.onrender.com/api/send/yuqlama/${yuqlamaId}`,{
        method:'PUT',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          checked:renameYuqlama[yuqlamaId],
          reason:''
        })
      })
      const data=await res.json()
      if (data) {
        alert(data.message)
        getYuqlamas()
        setRenameYuqlama({})
        setYuqlamaId(null)
        setReasonValue({})
        
      }
    }catch(err){
      console.log(err.message);
      alert(err.message)
      alert('1')
      alert(selectedvalue)
    }
      
    }else{
      try{
      const res =await fetch(`https://backendcrm-64wu.onrender.com/api/send/yuqlama/${yuqlamaId}`,{
        method:'PUT',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          checked:renameYuqlama[yuqlamaId],
          reason:selectedvalue

        })
      })
      const data=await res.json()
      if (data) {
        alert(data.message)
        getYuqlamas()
        setRenameYuqlama({})
        setYuqlamaId(null)
        setReasonValue({})
     
        
      }
    }catch(err){
      console.log(err.message);
      alert(err.message)
    }
    }
   }


return (
  <div className="app-wrapper">
    <header className="app-header">
      <h1 className="group-heading">
        Guruh: <span className="group-date">{group} {new Date(date).toLocaleDateString()}</span>
      </h1>
      <p className="students-info"><strong>Talabalar:</strong> {count}</p>
      <button onClick={()=>navigate('/main')}>Orqaga</button>

    {filtiredYuqlama.length===0 &&   !modal && (
        <button className="action-btn action-btn-primary" onClick={open}>
          Keldi keti
        </button>
      )}
      {modal && (
        <div className="modal-actions">
          <button className="action-btn action-btn-success" onClick={handleSubmit}>send</button>
          <button className="action-btn action-btn-danger" onClick={close}>cancel</button>
        </div>
      )}
    </header>

    {teachers.length > 0 ? (
      <section className="teachers-table">
        <div className="table-row table-header">
          <div className="cell cell-profile">Profil</div>
          <div className="cell cell-name">Full Name</div>
          <div className="cell cell-subject">{filtiredYuqlama.length==0 ?'Group' : "Sana"}</div>
          <div className="cell cell-phone">Hisobi</div>
          <div className="cell cell-phone">Telefon raqam</div>

          {!modal && <div className="cell cell-username">Username</div>}
          {modal && <div className="cell cell-attendance">Yo'qlama</div>}
        </div>
{filtiredYuqlama.length==0 ? (
        filteredData.map(item => (
          <div className="table-row table-data" key={item.id}>
            <div className="cell cell-profile">
              <img src={profile} alt="profile" className="profile-image" />
            </div>
            <div className="cell cell-name">{item.fullName}</div>
            <div className="cell cell-subject">{group}</div>
            {filtredHisob.map((h)=>h.username==item.username ? <div className='cell cell-phone'>{h.hisob} somoni</div>:'')}

            <div className="cell cell-phone">{item.addedBy}</div>
            {!modal && <div className="cell cell-username">{item.username}</div>}
            {modal && (
              <div className="cell cell-attendance">
                <input
                  type="checkbox"
                  className="attendance-checkbox"
                  checked={checkboxStates[item.fullName]|| false}
                  onChange={(e) => handleCheckboxChange(e, item.fullName)}
                />
              {checkboxStates[item.fullName] === false && (
  <select className="attendance-select" value={reasonInputs[item.fullName]||''} onChange={(e)=>handleReasonInputChange(e,item.fullName)}>
    <option value="">Sababsiz</option>
    <option value="reason">Sababli</option>
  </select>
)}

              </div>
        
            )}
          </div>
        ))) :(
filtiredYuqlama.map(y=>(
   <div className={filtredHisob.some((h)=>h.username==y.username && h.hisob<=0 )? 'table-pul-yuq':'table-row table-data'} key={y.id}>
            <div className="cell cell-profile">
              <img src={profile} alt="profile" className="profile-image" />
            </div>
            <div className="cell cell-name">{y.fullname}</div>
            <div className="cell cell-phone">{new Date(y.date).toISOString().split('T')[0]}</div>
            {filtredHisob.map((h)=>h.username==y.username ? <div className='cell cell-phone'>{h.hisob} somoni</div>:'')}
            <div className="cell cell-phone">{y.phone}</div>

            {!modal && <div className="cell cell-username">{y.username}</div>}
          
              <div className="cell cell-attendance">
                <input
                  type="checkbox"
                  className="attendance-checkbox"
                  checked={yuqlamaId == y._id ? renameYuqlama[y._id] :y.checked}
                  onChange={(e) => handleCheckboxChange1(e, y._id)}


                />
              {renameYuqlama[y._id]== false ?  (
                    
  <select  value={reasonValue[y._id] || ''} onChange={(e)=>setReasonValue(prev=>({
    ...prev,[y._id]:e.target.value
  }))} className="attendance-select">
    <option value="">Sababsiz</option>
    <option value="reason">Sababli</option>
  </select>
):<p>{y.reason}</p>}
{yuqlamaId == y._id && <button onClick={handleRenameYuqlama}>Uzgarishni saqlash</button>}

              </div>
        
          
          </div>
))

        )
        }
      </section>
    ) : (
      <div className="empty-state">
        <img src={bear} alt="sleeping bear" className="empty-image" />
        <h3 className="empty-title">No students yet</h3>
        <p className="empty-description">Students could be here after registering from admin panel</p>
      </div>
    )}
  </div>
);

}