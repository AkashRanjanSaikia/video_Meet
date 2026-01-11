import { useNavigate } from 'react-router-dom';
import "../App.css";
import "../styles/Navbar.css";
import { History } from 'lucide-react';

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
              className="navbar-btn"
              onClick={() => navigate("/history")}
            >
              <History size={19} />
              History
            </button>

            <button className="navbar-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
