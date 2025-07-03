
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Login from './Login';
import Main from './Main';
import GroupSt from './GroupSt';



function App() {
  return (
    <div className="App">
   <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                   <Route path='/main' element={<Main/>}></Route>

                   <Route path='/stgroup' element={<GroupSt/>}></Route>


                </Routes>
            </BrowserRouter>
    </div>
  );
}

export default App;
