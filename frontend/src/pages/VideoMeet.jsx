import { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from "socket.io-client";
import { IconButton, TextField, Button, Badge, Snackbar, Alert } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Menu, MenuItem } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { silence, black } from '../Helper/helper';
import withValidMeeting from "../utils/withValidMeeting";
import styles from '../styles/VideoMeet.module.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';



const server_url = import.meta.env.VITE_BACKEND_URL;

const connections = {};
const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

function VideoMeetComponent() {
    const routeTo = useNavigate();
    const { url } = useParams();
    const { userData } = useContext(AuthContext);

    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoref = useRef();
    const videoRef = useRef([])

    const [audioAvailable, setAudioAvailable] = useState(false);
    const [videoAvailable, setVideoAvailable] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(true);
    const [videoPermissionDenied, setVideoPermissionDenied] = useState(false);
    const [audioPermissionDenied, setAudioPermissionDenied] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    // New states for Participants and More Features
    const [showParticipants, setShowParticipants] = useState(false);
    const [moreFeaturesAnchor, setMoreFeaturesAnchor] = useState(null);
    const openMoreFeatures = Boolean(moreFeaturesAnchor);

    const [videos, setVideos] = useState([]); //others videos
    const [video, setVideo] = useState(false); //local video
    const [audio, setAudio] = useState(false); //local audio
    const [screen, setScreen] = useState(false);    //local screen share

    const [showModal, setModal] = useState(false);

    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);

    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [userNamesMap, setUserNamesMap] = useState({});

    useEffect(() => {
        if (userData && typeof userData === 'string') {
            setUsername(userData.charAt(0).toUpperCase() + userData.slice(1));
        } else {
            const storedUsername = localStorage.getItem("userName");
            if (storedUsername) {
                setUsername(storedUsername.charAt(0).toUpperCase() + storedUsername.slice(1));
            }
        }
        getPermissions();
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const setViewportHeight = () => {
            const viewport = window.visualViewport;
            const height = (viewport ? viewport.height : window.innerHeight) * 0.01;
            document.documentElement.style.setProperty('--vh', `${height}px`);
        };

        setViewportHeight();

        const viewport = window.visualViewport;

        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', setViewportHeight);
        if (viewport) {
            viewport.addEventListener('resize', setViewportHeight);
            viewport.addEventListener('scroll', setViewportHeight);
        }

        return () => {
            window.removeEventListener('resize', setViewportHeight);
            window.removeEventListener('orientationchange', setViewportHeight);
            if (viewport) {
                viewport.removeEventListener('resize', setViewportHeight);
                viewport.removeEventListener('scroll', setViewportHeight);
            }
        };
    }, []);


    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("video : ", video, "audio : ", audio);
        }
    }, [video, audio])

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])

    useEffect(() => {
        if (!askForUsername && localVideoref.current && window.localStream) {
            // When entering meeting, ensure video element has the current stream
            if (localVideoref.current.srcObject !== window.localStream) {
                localVideoref.current.srcObject = window.localStream;
                localVideoref.current.play().catch(e => console.log("Video play error:", e));
            }
        }
    }, [askForUsername])



    const getPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setVideoAvailable(true);
            setAudioAvailable(true);
            // Stop the tracks to release devices, as we are in "off" state initially
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error("Error accessing media devices:", error.name);
            if (error.name === 'NotAllowedError') {
                setVideoPermissionDenied(true);
                setAudioPermissionDenied(true);
                setSnackbarMessage("Permissions were denied. Please enable camera/mic access in your browser settings.");
                setSnackbarOpen(true);
            } else if (error.name === 'NotFoundError') {
                setSnackbarMessage("No camera or microphone found on this device.");
                setSnackbarOpen(true);
            }
        }
    };

    const getUserMedia = () => {
        console.log("getUserMedia : ", video, audio);

        // If user wants video or audio, request it (even if permissions weren't granted initially)
        if (video || audio) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then((stream) => {
                    // Update availability flags
                    if (video && stream.getVideoTracks().length > 0) {
                        setVideoAvailable(true);
                        setVideoPermissionDenied(false);
                    }
                    if (audio && stream.getAudioTracks().length > 0) {
                        setAudioAvailable(true);
                        setAudioPermissionDenied(false);
                    }

                    // Add black/silence tracks if video/audio is disabled
                    if (!video) {
                        let blackTrack = black();
                        blackTrack.enabled = true;
                        stream.addTrack(blackTrack);
                    }
                    if (!audio) {
                        let silenceTrack = silence();
                        stream.addTrack(silenceTrack);
                    }
                    getUserMediaSuccess(stream);
                })
                .catch((e) => {
                    console.log("Error getting user media:", e);

                    // Handle permission errors
                    if (e.name === 'NotAllowedError') {
                        if (video) {
                            setVideoPermissionDenied(true);
                            setVideoAvailable(false);
                            setVideo(false);
                        }
                        if (audio) {
                            setAudioPermissionDenied(true);
                            setAudioAvailable(false);
                            setAudio(false);
                        }
                        setSnackbarMessage("Permissions were denied. Please enable camera/mic access in your browser settings.");
                        setSnackbarOpen(true);
                    } else if (e.name === 'NotFoundError') {
                        if (video) {
                            setVideoPermissionDenied(true);
                            setVideoAvailable(false);
                            setVideo(false);
                        }
                        if (audio) {
                            setAudioPermissionDenied(true);
                            setAudioAvailable(false);
                            setAudio(false);
                        }
                        setSnackbarMessage("No camera or microphone found on this device.");
                        setSnackbarOpen(true);
                    }

                    // If permission denied or error, use black/silence
                    try {
                        let tracks = localVideoref.current?.srcObject?.getTracks();
                        if (tracks) {
                            tracks.forEach(track => track.stop());
                        }
                    } catch (err) { }

                    let blackTrack = black();
                    let silenceTrack = silence();
                    blackTrack.enabled = true;

                    let blackSilence = new MediaStream([blackTrack, silenceTrack]);
                    getUserMediaSuccess(blackSilence);
                });
        } else {
            // Both video and audio are off - use black/silence
            try {
                let tracks = localVideoref.current?.srcObject?.getTracks();
                if (tracks) {
                    tracks.forEach(track => track.stop());
                }
            } catch (e) { }

            let blackTrack = black();
            let silenceTrack = silence();
            blackTrack.enabled = true;

            let blackSilence = new MediaStream([blackTrack, silenceTrack]);
            getUserMediaSuccess(blackSilence);
        }
    }

    const getUserMediaSuccess = (stream) => {
        // 1. Stop old tracks
        if (window.localStream) {
            window.localStream.getTracks().forEach(track => track.stop());
        }

        // 2. Save & show local stream
        window.localStream = stream;

        // Ensure video ref is updated (works for both preview and meeting video)
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
            // Force video to play
            localVideoref.current.play().catch(e => console.log("Video play error:", e));
        }

        // 3. Update tracks for each peer
        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            const pc = connections[id];

            stream.getTracks().forEach(track => {
                const sender = pc.getSenders().find(s => s.track?.kind === track.kind);

                if (sender) {
                    // Replace existing track (BEST PRACTICE)
                    sender.replaceTrack(track);
                } else {
                    // First-time add
                    pc.addTrack(track, stream);
                }
            });
        }

        // 4. Handle unexpected camera/mic stop
        stream.getTracks().forEach(track => {
            track.onended = () => handleTrackEnded();
        });
    };

    const handleTrackEnded = () => {
        setVideo(false);
        setAudio(false);

        const blackSilence = new MediaStream([
            black(),
            silence()
        ]);

        window.localStream = blackSilence;

        // Update video ref with black silence stream
        if (localVideoref.current) {
            localVideoref.current.srcObject = blackSilence;
        }

        for (let id in connections) {
            const pc = connections[id];

            blackSilence.getTracks().forEach(track => {
                const sender = pc.getSenders().find(s => s.track?.kind === track.kind);
                if (sender) sender.replaceTrack(track);
            });
        }
    };

    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            // Use username if present, otherwise fall back to userData
            const displayUsername = username || (userData && typeof userData === 'string' ? userData : 'User');
            socketRef.current.emit('join-call', window.location.href, displayUsername)
            socketIdRef.current = socketRef.current.id

            // Set own username in the map
            setUserNamesMap(prev => ({ ...prev, [socketIdRef.current]: displayUsername }))

            socketRef.current.on('chat-message', addMessage)

            // Listen for existing usernames when joining
            socketRef.current.on('existing-usernames', (usernames) => {
                setUserNamesMap(prev => ({ ...prev, ...usernames }))
                // Update videos array with usernames
                setVideos(videos =>
                    videos.map(video =>
                        usernames[video.socketId]
                            ? { ...video, username: usernames[video.socketId] }
                            : video
                    )
                )
            })

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                setUserNamesMap(prev => {
                    const newMap = { ...prev };
                    delete newMap[id];
                    return newMap;
                })
            })

            socketRef.current.on('user-joined', (id, clients, joinedUsername) => {
                // Update username map if username is provided
                if (joinedUsername) {
                    setUserNamesMap(prev => ({ ...prev, [id]: joinedUsername }))
                    // Update videos array if video exists for this socketId
                    setVideos(videos =>
                        videos.map(video =>
                            video.socketId === id
                                ? { ...video, username: joinedUsername }
                                : video
                        )
                    )
                }

                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }
    const gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    const handleVideo = () => {
        // Only prevent enabling if permission was denied and user is trying to turn it on
        if (videoPermissionDenied && !video) {
            setSnackbarMessage("Camera permission was denied. Please enable camera access in your browser settings.");
            setSnackbarOpen(true);
            return;
        }
        setVideo(!video);
    }
    const handleAudio = () => {
        // Only prevent enabling if permission was denied and user is trying to turn it on
        if (audioPermissionDenied && !audio) {
            setSnackbarMessage("Microphone permission was denied. Please enable microphone access in your browser settings.");
            setSnackbarOpen(true);
            return;
        }
        setAudio(!audio);
    }
    const getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) {
            console.log(e);
        }
        window.localStream = stream;

        // Ensure video ref is updated (works for both preview and meeting video)
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
            // Force video to play
            localVideoref.current.play().catch(e => console.log("Video play error:", e));
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })

        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()

            // Update video ref with black silence stream
            if (localVideoref.current) {
                localVideoref.current.srcObject = window.localStream;
            }

            getUserMedia();

        })

    }
    const getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .catch((e) => {
                        console.log(e);
                        setScreen(false);
                    });
            } else {
                setScreen(false);
            }
        }
    }
    const handleScreen = () => {
        setScreen(!screen)
    }
    const handleChat = () => {
        setModal(!showModal)
    }
    const sendMessage = () => {
        const displayUsername = username || (userData && typeof userData === 'string' ? userData : 'User');
        socketRef.current.emit("chat-message", message, displayUsername);
        setMessage("");

    }
    const addMessage = (data, sender, socketIdSender) => {
        const isOwnMessage = socketIdSender === socketIdRef.current;

        setMessages((prevMessages) => [
            ...prevMessages,
            {
                sender: isOwnMessage ? "You" : sender,
                data: data
            }
        ]);

        if (!isOwnMessage) {
            setNewMessages((prevCount) => prevCount + 1);
        }
    };
    const getMedia = () => {
        connectToSocketServer();
    }
    const connect = () => {
        // Validation for video and audio permissions
        if (!videoAvailable || !audioAvailable) {
            setSnackbarMessage("Please enable both camera and microphone to continue.");
            setSnackbarOpen(true);
            return;
        }

        setAskForUsername(false);
        getMedia();
    }

    const handleMoreFeaturesClick = (event) => {
        setMoreFeaturesAnchor(event.currentTarget);
    };

    const handleMoreFeaturesClose = () => {
        setMoreFeaturesAnchor(null);
    };

    const handleParticipantsToggle = () => {
        setShowParticipants(!showParticipants);
    };

    const handleEndCall = useCallback(() => {
        try {
            // 1. Stop local media
            if (localVideoref.current?.srcObject) {
                localVideoref.current.srcObject
                    .getTracks()
                    .forEach(track => track.stop());
            }

            // 2. Close and remove all peer connections
            for (let id in connections) {
                if (connections[id]) {
                    connections[id].onicecandidate = null;
                    connections[id].ontrack = null;
                    connections[id].onaddstream = null;

                    connections[id].close();
                    delete connections[id];
                }
            }

            // 3. Notify server (if socket exists)
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit("end-call");
                socketRef.current.disconnect();
            }

            // 4. Navigate away (only if not already navigating)
            if (routeTo) {
                routeTo("/home");
            }

        } catch (e) {
            console.error("Error ending call:", e);
        }
    }, [routeTo]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Only trigger cleanup if user is actually in the meeting
            if (!askForUsername && socketRef.current) {
                handleEndCall();
            }
        };

        // Add event listener
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup: remove event listener when component unmounts
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // Also call cleanup on component unmount
            if (!askForUsername && socketRef.current) {
                handleEndCall();
            }
        };
    }, [askForUsername, handleEndCall])


    return (
        <div>
            {askForUsername === true ?
                <div className={styles.container}>
                    <div className={styles.previewContainer}>
                        <video className={styles.videoPreview} ref={localVideoref} autoPlay muted></video>
                        <div className={styles.controls}>
                            <IconButton
                                onClick={handleVideo}
                                className={!video ? styles.videoOff : ''}
                                title={videoPermissionDenied && !video ? "Camera permission denied" : ""}
                            >
                                {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                            <IconButton
                                onClick={handleAudio}
                                className={!audio ? styles.videoOff : ''}
                                title={audioPermissionDenied && !audio ? "Microphone permission denied" : ""}
                            >
                                {(audio === true) ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>
                        </div>
                    </div>
                    <div className={styles.lobbyContainer}>
                        <div className={styles.rightPart}>
                            <h2 className={styles.title}>Enter into Lobby</h2>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={styles.input}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={connect}
                                className={styles.button}
                            >
                                Connect
                            </Button>
                        </div>
                    </div>
                </div>
                :
                <div className={styles.meetvideoContainer}>

                    {showModal ?
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <div className={styles.chatHeader}>
                                    <h1>Chat</h1>
                                    <IconButton onClick={() => setModal(!showModal)} className={styles.closeButton}>
                                        <CloseIcon />
                                    </IconButton>
                                </div>
                                <div className={styles.chatingDisplay}>
                                    {messages.map((item, index) => {
                                        return (
                                            <div key={index}>
                                                <p>{item.sender}</p>
                                                <p>{item.data}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className={styles.chatingArea}>

                                    <TextField id="outlined-basic" value={message} onChange={(e) => { setMessage(e.target.value) }} label="Enter Your chat" />
                                    <Button variant='contained' onClick={sendMessage}>Send</Button>
                                </div>
                            </div>

                        </div> : <></>
                    }

                    <div className={`${styles.conferenceView} ${showModal ? styles.chatOpen : ''}`}>

                        {videos.map((video) => (
                            <div key={video.socketId} className={styles.videoWrapper}>
                                <video
                                    className={styles.otherVideo}
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                >
                                </video>
                                <span className={styles.userName}>
                                    {userNamesMap[video.socketId] || 'User'}
                                </span>
                            </div>

                        ))}

                        <div className={styles.videoWrapper}>
                            <video className={styles.userVideo} ref={localVideoref} autoPlay muted></video>
                            <span className={styles.userName}>
                                {username || (userData && typeof userData === 'string' ? userData : 'You')}
                            </span>
                        </div>
                        
                    </div>
                    
                    <div>
                        <div className={styles.meetingInfoContainer}>
                            <p>{window.location.href.split('/').pop()}</p>
                            <IconButton onClick={() => {
                                navigator.clipboard.writeText(url);
                                setSnackbarMessage("Meeting Code Copied to Clipboard");
                                setSnackbarOpen(true);
                            }}>
                                <ContentCopyIcon />
                            </IconButton>
                            <IconButton onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'Meeting Link',
                                        text: 'Join my meeting!',
                                        url: window.location.href,
                                    })
                                    .catch((error) => console.log('Error sharing', error));
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    setSnackbarMessage("Meeting URL Copied to Clipboard");
                                    setSnackbarOpen(true);
                                }
                            }}>
                                <ShareIcon />
                            </IconButton>
                        </div>

                        <div className={styles.buttonContainers}>
                            <IconButton
                                onClick={handleVideo}
                                title={videoPermissionDenied && !video ? "Camera permission denied" : ""}
                            >
                                {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                            <IconButton
                                onClick={handleAudio}
                                title={audioPermissionDenied && !audio ? "Microphone permission denied" : ""}
                            >
                                {(audio === true) ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>

                            <IconButton onClick={handleScreen} className={styles.hideOnSmall}>
                                {(screen === true) ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton>
                            <IconButton onClick={handleEndCall} className={styles.danger}>
                                <CallEndIcon />
                            </IconButton>

                        </div>
                        <div className={styles.rightControls}>
                            <IconButton onClick={handleParticipantsToggle} title="Participants">
                                <GroupIcon />
                            </IconButton>

                            <Badge badgeContent={newMessages} max={999} color='secondary'>
                                <IconButton onClick={handleChat}><ChatIcon /></IconButton>
                            </Badge>

                            <IconButton onClick={handleMoreFeaturesClick} title="More Options">
                                <MoreVertIcon />
                            </IconButton>
                        </div>

                    </div>
                </div>
            }
            {/* Participants Dialog */}
            <Dialog 
                open={showParticipants} 
                onClose={handleParticipantsToggle}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Participants ({videos.length + 1})</DialogTitle>
                <DialogContent dividers>
                    <List>
                        {/* Local User */}
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={username || (userData && typeof userData === 'string' ? userData : 'You')} 
                                secondary="(You)" 
                            />
                        </ListItem>
                        
                        {/* Remote Users */}
                        {videos.map((video) => (
                            <ListItem key={video.socketId}>
                                <ListItemAvatar>
                                    <Avatar>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={userNamesMap[video.socketId] || 'User'} 
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleParticipantsToggle} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* More Features Menu */}
            <Menu
                anchorEl={moreFeaturesAnchor}
                open={openMoreFeatures}
                onClose={handleMoreFeaturesClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleMoreFeaturesClose}>
                    <SettingsIcon sx={{ mr: 1 }} /> Settings
                </MenuItem>
                <MenuItem onClick={() => {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else {
                        document.documentElement.requestFullscreen();
                    }
                    handleMoreFeaturesClose();
                }}>
                    <FullscreenIcon sx={{ mr: 1 }} /> Full Screen
                </MenuItem>
                <MenuItem onClick={handleMoreFeaturesClose}>
                    <HelpIcon sx={{ mr: 1 }} /> Help
                </MenuItem>
            </Menu>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity="warning"
                    sx={{
                        width: '100%',
                        backgroundColor: 'rgba(26, 35, 52, 0.95)',
                        color: '#e0e0e0',
                        '& .MuiAlert-icon': {
                            color: '#ff9800'
                        }
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}
export default withValidMeeting(VideoMeetComponent);
   
