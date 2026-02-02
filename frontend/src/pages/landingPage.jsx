// import '../App.css';
import '../styles/landingPage.css';
import { useNavigate } from 'react-router-dom';
import { Video, LogIn, LogOut, Users } from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { useContext , useEffect } from "react";

function LandingPage() {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const router = useNavigate();
    useEffect(() => {
        fetch(process.env.VITE_BACKEND_URL + "/health")
            .catch(() => null);
    }, []);


    return (
        <div className="landingPageContainer">
            <nav >
                <div>
                    <h1><span className="logo-highlight">Video</span>Meet</h1>
                </div>
                <div className="navlist">
                    <button
                        className="nav-btn guest-btn"
                        onClick={() => router("/home")}
                    >
                        <Users size={19} /> Join as Guest
                    </button>

                    {isAuthenticated ? (
                        <button className="nav-btn auth-btn" onClick={logout}>
                            <LogOut size={19} />
                            Logout
                        </button>
                    ) : (
                        <button
                            className="nav-btn auth-btn"
                            onClick={() => router("/auth")}
                        >
                            <LogIn size={19} />
                            Login
                        </button>
                    )}
                </div>

            </nav>

            <div className="landingMainContainer">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Video />
                        <span>Professional Video Meetings</span>
                    </div>
                    <h1 className="hero-title">
                        Connect with your team <span className="highlight">anywhere</span>
                    </h1>
                    <p className="hero-subtitle">Crystal-clear HD video, seamless screen sharing, and enterprise-grade security for remote collaboration that feels natural.</p>
                    <div className="cta-container">
                        <button className="cta-button primary" onClick={() => { isAuthenticated ? router("/home") : router("/auth") }}>
                            Get Started
                        </button>
                        <button className="cta-button secondary" onClick={() => { router("/home") }}>
                            Join Meeting
                        </button>
                    </div>
                    <div className="features-preview">
                        <div className="feature">
                            <i className="fas fa-video"></i>
                            <span>HD Video</span>
                        </div>
                        <div className="feature">
                            <i className="fas fa-lock"></i>
                            <span>Secure</span>
                        </div>
                        <div className="feature">
                            <i className="fas fa-desktop"></i>
                            <span>Screen Share</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default LandingPage;