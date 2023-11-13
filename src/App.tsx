import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import Router from './assets/router/router';

function App() {
  return (
    <>
      <Router />  
      <ToastContainer />
    </>
  )
}

export default App
