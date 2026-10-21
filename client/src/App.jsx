import React , {useEffect} from 'react'
import "./services/axiosconfig";
import { Route, Routes , Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Notes from './pages/Notes'
import History from './pages/History'
import Pricing from './pages/Pricing'
import {getCurrentUser} from './services/api.js';
import { useDispatch, useSelector } from 'react-redux';
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import PaymentFailed from './pages/PaymentFailed.jsx'
export const serverURL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://ai-exam-notes-backend-0rlt.onrender.com");

function App () {
  const dispatch = useDispatch();
  useEffect(() => {
    getCurrentUser(dispatch);
  }, [dispatch]);

  const{userData} = useSelector((state) => state.user);
  console.log(userData);
  return (
    <>
    <Routes>
      <Route path='/' element={userData ? <Home/> : <Navigate to="/auth" replace/>} />
      <Route path='/auth' element={userData ? <Navigate to="/"  replace/> : <Auth/>} />
      <Route path='/notes' element={userData ? <Notes/> : <Navigate to="/auth" replace/>} />
      <Route path='/history' element={userData ? <History/> : <Navigate to="/auth" replace/>} />
      <Route path='/pricing' element={userData ? <Pricing/> : <Navigate to="/auth" replace/>} />

      <Route path='/payment-success' element={ <PaymentSuccess/>} />
      <Route path='/payment-failed' element={ <PaymentFailed/>} />
    </Routes>
    </> 
  )
}

export default App
