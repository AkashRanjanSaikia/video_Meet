import { useState, useRef, useContext } from "react";
import { AuthContext  } from '../contexts/AuthContext';
import { useNavigate } from "react-router-dom";
import { Video, LogIn, ArrowLeft, Copy } from "lucide-react";
import { Snackbar, Alert } from "@mui/material";
import "../App.css";
import "../styles/Home.css";
import Navbar from "../components/Navbar";


const Home = () => {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");
  const [mode, setMode] = useState("join");
  const meetingInputRef = useRef(null);
  const { addToUserHistory } = useContext(AuthContext);
  const isAuthenticated = Boolean(localStorage.getItem("token"));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCreateMeeting = async () => {
    if (!isAuthenticated) {
      setSnackbarMessage("Please log in to create a meeting");
      setSnackbarOpen(true);
      return;
    }
    const res = await fetch("http://localhost:8000/api/meetings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: localStorage.getItem("userName") }),
    });
    const data = await res.json();
    console.log(data);
    navigate(`/${data.meetingId}`);
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (meetingId.trim()) {
      const res = await fetch(`http://localhost:8000/api/meetings/join/${meetingId}`);
      const data = await res.json();
      if (data.success) {
        navigate(`/${meetingId}`);
      } else {
        setSnackbarMessage(data.message);
        setSnackbarOpen(true);
      }
    }
  };

  const handleCopyMeetingCode = () => {
    navigator.clipboard.writeText(meetingId);
  };

  return (
    <>
      <div className="container">
        <Navbar />
        <div className="join-container">
          <div className="join-card">
            <div className="join-header">
              <h1 className="join-title">Video<span className="highlight" >Meet</span></h1>
              <p className="join-subtitle">Start or join your video meeting</p>
            </div>

            {/* Toggle Buttons */}
            <div className="mode-toggle">
              <button
                className={`toggle-btn ${mode === "create" ? "active" : ""}`}
                onClick={() => {
                  setMode("create");
                  if (!isAuthenticated) {
                    setSnackbarMessage("Please log in to create a meeting");
                    setSnackbarOpen(true);
                  }
                }}
              >
                <Video size={18} style={{ marginRight: "8px" }} />
                Create Meeting
              </button>
              <button
                className={`toggle-btn ${mode === "join" ? "active" : ""}`}
                onClick={() => setMode("join")}
              >
                <LogIn size={18} style={{ marginRight: "8px" }} />
                Join Meeting
              </button>
            </div>

            <div className="card-content">
              {mode === "create" ? (
                <>
                  <h2>Create New Meeting</h2>
                  <p>Start an instant meeting and invite others to join</p>
                  <button
                    className="action-btn"
                    onClick={handleCreateMeeting}
                  >
                    Create Meeting
                  </button>
                </>
              ) : (
                <>
                  <h2>Join Meeting</h2>
                  <p>Enter a meeting ID to join an ongoing session</p>
                  <form onSubmit={handleJoinMeeting} className="join-form">
                    <label htmlFor="meetingId">Meeting ID</label>
                    <div className="input-with-copy">
                      <input
                        id="meetingId"
                        placeholder="Enter meeting ID"
                        value={meetingId}
                        onChange={(e) => setMeetingId(e.target.value)}
                        className="input-field"
                        ref={meetingInputRef}
                      />
                      {meetingId && (
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={handleCopyMeetingCode}
                          title="Copy meeting code"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="action-btn secondary"
                      disabled={!meetingId.trim()}
                    >
                      Join Meeting
                    </button>
                  </form>
                </>
              )}
            </div>

            <div className="back-btn-container">
              <button className="back-btn" onClick={() => navigate("/")}>
                <ArrowLeft size={16} style={{ marginRight: "6px" }} />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          variant="filled"
          sx={{
            width: '100%',
            bgcolor: '#1976d2',
            color: '#fff'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </>
  );
};

export default Home;
