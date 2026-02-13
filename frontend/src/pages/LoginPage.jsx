import "../App.css";
import "../styles/LoginPage.css";
import { useState, useContext } from "react";
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import { Video, Eye, EyeOff, ArrowLeft, UserPlus, LogIn, User, Lock, UserCircle } from "lucide-react";


const LoginPage = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState(0); // 0: Login, 1: Register
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [showPassword, setShowPassword] = useState(false);

  const { userData, setUserData, handleRegister, handleLogin  } = useContext(AuthContext);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formState === 0) {
        // LOGIN
        if (!username || !password) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }

        const res = await handleLogin(username, password);

        if (!res.success) {
          throw new Error(res.message);
        }

        // Success: show message + redirect
        setUserData(username);
        setMessage("Login successful!");
        setSeverity("success");
        setOpen(true);

        setTimeout(() => {
          navigate("/home");
        }, 500);

      } else {
        // REGISTER
        if (!name || !username || !password) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }

        const result = await handleRegister(name, username, password);
        setUsername("");
        setPassword("");
        setName("");

        setMessage(result || "Registration successful!");
        setSeverity("success");
        setOpen(true);
        setError("");
        setFormState(0);
      }

    } catch (err) {
      const errorMessage = err.message || "Authentication failed";
      setError(errorMessage);
      setMessage(errorMessage);
      setSeverity("error");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  
  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="join-header">
            <h1 className="join-title">Video<span className="highlight">Meet</span></h1>
            {/* <p className="join-subtitle">Start or join your video meeting</p> */}
          </div>
          <div className="mode-toggle">
            <button
              className={`toggle-btn ${formState === 0 ? "active" : ""}`}
              onClick={() => {
                setFormState(0);
                setError('');
              }}
            >
              <LogIn size={18} style={{ marginRight: "8px" }} />
              Sign In
            </button>
            <button
              className={`toggle-btn ${formState === 1 ? "active" : ""}`}
              onClick={() => {
                setFormState(1);
                setError('');
              }}
            >
              <UserPlus size={18} style={{ marginRight: "8px" }} />
              Sign Up
            </button>
          </div>

          <div className="card-content">
            <h2 className="auth-heading">
              {formState === 0 ? "Welcome back" : "Create an account"}
            </h2>
            <p className="auth-subheading">
              {formState === 0
                ? "Enter your credentials to access your account"
                : "Enter your information to get started"}
            </p>

            <form onSubmit={handleAuth} className="auth-form">
                {formState === 1 && (
                  <div className="auth-field">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-with-icon">
                      <UserCircle className="field-icon" size={18} />
                      <input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="username">Username</label>
                  <div className="input-with-icon">
                    <User className="field-icon" size={18} />
                    <input
                      id="username"
                      type="text"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="password">Password</label>
                  <div className="input-with-icon">
                    <Lock className="field-icon" size={18} />
                    <div className="password-input-container">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {formState === 0 && (
                  <div className="form-options" style={{ justifyContent: 'flex-end' }}>
                    
                    <button type="button" className="text-link-btn">Forgot password?</button>
                  </div>
                )}

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Please wait..." : formState === 0 ? "Sign In" : "Sign Up"}
              </button>
            </form>
          </div>

          <div className="back-btn-container">
            <button className="back-btn" onClick={() => navigate("/")}>
              <ArrowLeft size={16} style={{ marginRight: "6px" }} />
              Back to Home
            </button>
          </div>
        </div>
      </div>


      <Snackbar
        className="snackbar"
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: -12 }}
      >
        <Alert 
          onClose={() => setOpen(false)} 
          severity={severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            fontSize:'12px',
            bgcolor: severity === 'success' ? 'rgba(17, 222, 254, 0.9)' : 'rgba(204, 85, 85, 0.9)',
            color: severity === 'success' ? '#000' : '#fff',
            fontWeight: 600,
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: severity === 'success' ? '1px solid rgba(17, 222, 254, 0.5)' : '1px solid rgba(204, 85, 85, 0.5)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            '& .MuiAlert-icon': {
              color: severity === 'success' ? '#000' : '#fff',
            },
            '& .MuiAlert-action': {
              color: severity === 'success' ? '#000' : '#fff',
            }
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LoginPage;
