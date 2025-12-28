import { AuthProvider } from "./contexts/AuthContext";
import withAuth from "./utils/withAuth";
import LandingPage from "./pages/landingPage";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import History from './pages/history.jsx';
import Auth from "./pages/LoginPage.jsx";
import VideoMeet from "./pages/VideoMeet.jsx";
import Home from "./pages/Home.jsx";


function App() {
  
  const ProtectedHistory = withAuth(History);
  
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/auth' element={<Auth />} />
            <Route path='/:url' element={<VideoMeet/>} />
            <Route path='/history' element={<ProtectedHistory />} />
            <Route path='/home' element={<Home/>} />
             
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
