import express from "express";
import Meeting from "../models/meetings.model.js";


const router = express.Router();


router.post("/create", async (req, res) => {
  try {
    const userId = req.body.userName || "guest";
    const meetingId = Math.random().toString(36).substring(2, 10);
    const newMeeting = new Meeting({user_id: userId  , meetingCode: meetingId});
    await newMeeting.save();
    res.status(201).json({ success: true, meetingId });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating meeting" });
  }
});


router.get("/join/:meetingId", async (req, res) => {
    console.log("Joining meeting:", req.params.meetingId);
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findOne({ meetingCode : meetingId });
    console.log(meeting)
    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }else if(meeting.status !== "ongoing"){
      return res
        .status(400)
        .json({ success: false, message: "Meeting is not ongoing" });
    }

    res.status(200).json({ success: true, meeting });
  } catch (err) {
    console.error("Error in /join/:meetingId:", err);
    res.status(500).json({ success: false, message: "Error joining meeting", error: err.message });
  }
});

export default router;
