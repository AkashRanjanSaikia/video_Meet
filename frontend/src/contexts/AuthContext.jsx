import axios from 'axios';
import { Children, createContext, useContext, useState, useEffect } from "react";
import httpsStatus from 'http-status';
import { useNavigate } from 'react-router-dom';


export const AuthContext = createContext({});

const client = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL + "/api/v1/users"
})

export const AuthProvider = ({ children }) => {
    const authContext = useContext(AuthContext);
    const [userData, setUserData] = useState(authContext);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useNavigate();

    const token = localStorage.getItem("token");

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                const isvalid = await client.get("/isValid", {
                    params: { token },
                });
                
                if (isvalid.data.isValid) {
                    setIsAuthenticated(true);
                }
            } catch {
                logout();
            }
        };

        verifyToken();
    }, [token]);



    const logout = () => {
        console.log("logout");
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        setIsAuthenticated(false);
        setUserData(null);
        router("/");
    };

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })
            if (request.status === httpsStatus.CREATED) {
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            const request = await client.post("/login", { username, password });

            if (request.status === httpsStatus.OK) {
                localStorage.setItem("token", request.data.token);
                localStorage.setItem("userName", username);
                return { success: true, data: request.data };
            } else {
                return { success: false, message: "Invalid credentials" };
            }
        } catch (err) {
            const message =
                err.response?.data?.message || "Invalid username or password";
            return { success: false, message };
        }
    };


    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch
        (err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {

        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }




    const data = {
        userData, setUserData, handleRegister, handleLogin, addToUserHistory, getHistoryOfUser, isAuthenticated , logout
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}