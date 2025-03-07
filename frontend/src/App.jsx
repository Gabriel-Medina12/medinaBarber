import { useState } from 'react'
import './App.css'
import Header from './components/header'
import NavBar from './components/NavBar'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/login.jsx'
import Home from './pages/home.jsx';
import ForgotPassword from './pages/auth/forgotPassword.jsx';

function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <NavBar />
        <Routes>
          <Route path="/" element={< Home/>} />
          <Route path="/pages/auth/login" element={<Login />} />
          <Route path='/pages/auth/forgotPassword' element={< ForgotPassword />}/>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App