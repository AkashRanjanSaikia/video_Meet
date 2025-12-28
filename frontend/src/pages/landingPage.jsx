import '../App.css';
import { useNavigate } from 'react-router-dom';
import { Video } from "lucide-react";

function LandingPage() {
    const router = useNavigate();
    return (
        <div className="landingPageContainer">
            <nav >
                <div>
                    <h1><span className="logo-highlight">Video</span>Meet</h1>
                </div>
                <div className='navlist'>
                    <button className="nav-btn guest-btn" onClick={() => { router("/home") }}>
                        <i className="fas fa-user-friends"></i> Join as Guest
                    </button>
                    <button className="nav-btn login-btn" onClick={() => { router("/auth") }}>
                        <i className="fas fa-sign-in-alt"></i> Login
                    </button>
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
                        <button className="cta-button primary" onClick={() => { router("/auth") }}>
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