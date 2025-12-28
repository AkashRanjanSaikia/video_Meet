import "../styles/LoginPage.css";
import { useState, useContext } from "react";
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import { Video, Eye, EyeOff ,ArrowLeft } from "lucide-react";


const LoginPage = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState(0);
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
        <div className="auth-logo">
          <div className="auth-icon">
            <Video />
          </div>
          <h1 className="join-title">Video<span className="highlight" >Meet</span></h1>
        </div>

        <div className="auth-card">
          <h2 className="auth-heading">
            {formState === 0 ? "Welcome back" : "Create an account"}
          </h2>
          <p className="auth-subheading">
            {formState === 0
              ? "Enter your credentials to access your account"
              : "Enter your information to get started"}
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="auth-form">
            {formState === 1 && (
              <div className="auth-field">
                <label htmlFor="name">Full Name</label>
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
            )}

            <div className="auth-field">
              <label htmlFor="username">Username</label>
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

            <div className="auth-field">
              <label htmlFor="password">Password</label>
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

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Please wait..." : formState === 0 ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="auth-toggle">
            <p>
              {formState === 0
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <button
              className="auth-switch-btn"
              onClick={() => {
                setFormState(formState === 0 ? 1 : 0);
                setError('');
              }}
              type="button"
            >
              {formState === 0 ? "Create new account" : "Sign in instead"}
            </button>
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
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
      >
        <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LoginPage;
