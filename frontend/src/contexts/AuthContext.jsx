import axios from 'axios';
import { Children, createContext, useContext, useState } from "react";
import httpsStatus from 'http-status';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users"
})

export const AuthProvider = ({ children }) => {
    const authContext = useContext(AuthContext);
    const [userData, setUserData] = useState(authContext);
    const router = useNavigate();
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
        userData, setUserData, handleRegister, handleLogin, addToUserHistory, getHistoryOfUser
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}