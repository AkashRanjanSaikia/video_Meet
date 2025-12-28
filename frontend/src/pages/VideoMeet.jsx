import { useEffect, useRef, useState, useContext } from 'react'
import io from "socket.io-client";
import { useNavigate } from 'react-router-dom';
import { IconButton, TextField, Button, Badge } from '@mui/material';
import styles from '../styles/VideoMeet.module.css';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { silence, black } from '../Helper/helper'
import { AuthContext } from '../contexts/AuthContext';
import withValidMeeting from "../utils/withValidMeeting";

const server_url = "https://videomeet-8y4i.onrender.com";
var connections = {};
const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}
function VideoMeetComponent() {
    let routeTo = useNavigate();
    const { userData } = useContext(AuthContext);
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    const videoRef = useRef([])

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState(true);

    let [videos, setVideos] = useState([])
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(false);

    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [userNamesMap, setUserNamesMap] = useState({}); // Map socketId to username

    useEffect(() => {
        console.log("HELLO")
        getPermissions();
        // Auto-fill username from AuthContext if available
        if (userData && typeof userData === 'string') {
            setUsername(userData);
        }
    }, [userData])

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio])

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen)
    }
    let handleChat = () => {
        setModal(!showModal)
    }
    let sendMessage = () => {
        const displayUsername = username || (userData && typeof userData === 'string' ? userData : 'User');
        socketRef.current.emit("chat-message", message, displayUsername);
        setMessage("");
    }
    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }

        ])
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevMessages) => prevMessages + 1)

        }
    };
    const handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            socketRef.current.emit("end-call");
            routeTo("/home");

        } catch (e) {
            console.log(e);
        }
    }
    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }
    
    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }



            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };
    let getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) {
            console.log(e);
        }
        window.localStream = stream;
        localVideoref.current.srcObject = stream;

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
            localVideoref.current.srcObject = window.localStream

            getUserMedia();

        })

    }
    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => { console.log(e) });
            }
        }
    }
    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }
    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }
    let gotMessageFromServer = (fromId, message) => {
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
    let connectToSocketServer = () => {
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
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    return (
        <div>
            {askForUsername === true ?
                <div className={styles.container}>
                    <div className={styles.lobbyContainer}>
                        <div className={styles.leftPart}>
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
                                <h1>Chat</h1>
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

                                    <TextField id="outlined-basic" onChange={(e) => { setMessage(e.target.value) }} label="Enter Your chat" />
                                    <Button variant='contained' onClick={sendMessage}>Send</Button>
                                </div>
                            </div>

                        </div> : <></>
                    }

                    <div className={styles.localVideoWrapper}>
                        <video className={styles.userVideo} ref={localVideoref} autoPlay muted></video>
                        <span className={styles.userName}>
                            {username || (userData && typeof userData === 'string' ? userData : 'You')}
                        </span>
                    </div>

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleAudio}>
                            {(audio === true) ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall}>
                            <CallEndIcon />
                        </IconButton>
                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen}>
                                {(screen === true) ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>
                        }
                        <Badge badgeContent={newMessages} max={999} color='secondary'>
                            <IconButton onClick={handleChat}><ChatIcon /></IconButton>
                        </Badge>

                    </div>

                    <div className={styles.dark}>
                        <div className={styles.conferenceView}>

                            {videos.map((video) => (
                                <div key={video.socketId} className={styles.videoWrapper}>
                                    <video

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

                        </div>
                    </div>

                </div>
            }
        </div>
    )
}
export default withValidMeeting(VideoMeetComponent);