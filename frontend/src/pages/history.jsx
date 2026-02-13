import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/history.css'; // Import the CSS file

function CalendarIcon() {
    // Simple calendar SVG icon
    return (
        <span className="history-icon" role="img" aria-label="calendar" style={{ marginRight: 6, verticalAlign: 'middle' }}>
            <svg width="18" height="18" fill="#9ca3af" viewBox="0 0 24 24"><rect width="18" height="16" x="3" y="5" rx="2" fill="none" stroke="#9ca3af" strokeWidth="2" /><line x1="3" y1="9" x2="21" y2="9" stroke="#9ca3af" strokeWidth="2" /><rect width="2" height="2" x="7" y="13" fill="#11defe" /><rect width="2" height="2" x="11" y="13" fill="#11defe" /><rect width="2" height="2" x="15" y="13" fill="#11defe" /></svg>
        </span>
    );
}

function TimeIcon() {
    // Simple clock SVG icon
    return (
        <span className="history-icon" role="img" aria-label="time" style={{ marginRight: 6, verticalAlign: 'middle' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" stroke="#11defe" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </span>
    );
}

function MeetingRoomIcon() {
    // Simple meeting room SVG icon
    return (
        <span className="history-icon" role="img" aria-label="room" style={{ marginRight: 12, verticalAlign: 'middle' }}>
            <svg height="30px" width="30px" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="13" height="13" rx="2" fill="#11defe" /><rect x="16" y="9" width="5" height="9" rx="1" fill="#82f1ff" /><rect x="7" y="3" width="6" height="4" rx="1" fill="#11defe" /></svg>
        </span>
    );
}


function ArrowBackIcon() {
    return (
        <span className="history-icon" role="img" aria-label="back" style={{ marginRight: 8, verticalAlign: 'middle' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" stroke="#11defe" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </span>
    );
}

function Spinner() {
    // Simple loading spinner
    return (
        <div className="history-spinner" style={{ display: 'inline-block', margin: '30px auto', width: 40, height: 40 }}>
            <div className="history-spinner-circle" />
        </div>
    );
}

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const history = await getHistoryOfUser();
                setMeetings(history || []);
            } catch (error) {
                setMeetings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [getHistoryOfUser]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const joinMeeting = (code) => navigate(`/${code}`);
    const goHome = () => navigate('/home');

    return (
        <div className="history-root">
            <header className="history-appbar">
                <div className="history-appbar-container">
                    <div className="history-appbar-title">
                        <img src="/video_icon.svg" alt="icon" />
                        <span>
                            <span className="history-appbar-gradient">
                                Video</span>Meet
                        </span>

                    </div>
                    <button className="history-back-btn" onClick={goHome}>
                        <ArrowBackIcon />
                        <span className="history-back-btn-text">Back to Home</span>
                    </button>
                </div>
            </header>
            <main className="history-main-container">
                <h1 className="history-heading">Meeting History</h1>
                {loading ? (
                    <Spinner />
                ) : meetings.length > 0 ? (
                    <div className="history-meetings-list">
                        {meetings.map((meeting, idx) => (
                            <div className="history-meeting-card" key={idx}>
                                <div className="history-meeting-card-row">
                                    <div className="history-meeting-card-info">
                                        <MeetingRoomIcon />
                                        <div>
                                            <div className="history-meeting-code-row">
                                                <span className="history-meeting-label">Meeting:</span>
                                                <span className="history-meeting-code">{meeting.meetingCode}</span>
                                            </div>
                                            <div className="history-meeting-details">
                                                <span className="history-date">
                                                    <CalendarIcon />
                                                    {formatDate(meeting.date)}
                                                </span>
                                                <span className="history-time">
                                                    <TimeIcon />
                                                    {formatTime(meeting.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        meeting.status === "ongoing" && (
                                            <button
                                                className="history-join-btn"
                                                onClick={() => joinMeeting(meeting.meetingCode)}
                                            >
                                                Join Again
                                            </button>
                                        )
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="history-empty-card">
                        <div className="history-empty-title">No meeting history found</div>
                        <div className="history-empty-desc">
                            Your past meetings will appear here
                        </div>
                        <button className="history-start-btn" onClick={goHome}>
                            Start a Meeting
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
