import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("token"));
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <nav className="nav">
      <div className="navlist">
        {isAuthenticated && (
          <>
            <button
              className="navbar-history-btn"
              onClick={() => navigate("/history")}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20" height="20"
                viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round"
                style={{ verticalAlign: 'middle' }}
              >
                <path d="M3 12a9 9 0 1 0 3-7.7"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
              </svg>
              History
            </button>

            <button className="nav-btn login-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
