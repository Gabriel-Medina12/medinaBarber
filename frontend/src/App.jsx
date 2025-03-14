import Header from './components/Header.jsx'
import NavBar from './components/NavBar'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login.jsx'
import Home from './pages/Home.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import Footer from './components/Footer.jsx';
import Contacto from './pages/Contacto.jsx';
import './app.css'
function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <NavBar />
        <Routes>
          <Route path="/" element={< Home/>} />
          <Route path='/#servicios' element={< Home />}/>
          <Route path='/#siguenos' element={< Home />}/>
          <Route path="/pages/auth/login" element={<Login />} />
          <Route path='/pages/auth/forgotPassword' element={< ForgotPassword />}/>
          <Route path='/pages/contacto' element={< Contacto />}/>
        </Routes>
        <Footer/>
      </BrowserRouter>

    </>
  )
}

export default App