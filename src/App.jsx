// import './App.css'
// import { Button } from './components/ui/button'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import { Toaster } from 'react-hot-toast'
import Signup from './pages/Signup'
import Home from './pages/Home'
import SavedUser from './pages/SavedUser'
function App() {


  return (
    <>
      <Toaster position='top-right' />
      <Routes>

        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/savedUsers' element={<SavedUser />} />
      </Routes>
    </>
  )
}

export default App
