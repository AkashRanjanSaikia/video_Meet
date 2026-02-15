import express from "express";
import {createServer} from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./src/routes/user.routes.js";
import meetingRoutes from "./src/routes/meeting.routes.js";
import { connectToSocket } from "./src/controllers/socketManager.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port" , (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb" ,extended:true }));

app.use("/api/v1/users",userRoutes);
app.use("/api/meetings", meetingRoutes);



app.get("/" ,(req,res)=>{
    res.json("Welcome Akash");
})
app.get("/health", (req, res) => {
    console.log("Health check received");
    res.status(200).json({ status: "ok" });
});


const start = async()=>{
    const connectDb = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB is connected");
    server.listen(app.get("port"),()=>{
        console.log("PORT IS LISTENING ");
    })
}
start();
