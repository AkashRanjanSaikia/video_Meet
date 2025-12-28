import mongoose, { Schema } from "mongoose";
const meetingsSchema = new Schema({
  user_id: { type: String },
  meetingCode: { type: String, require: true },
  date: { type: Date, default: Date.now, require: true },
  status: {
    type: String,
    enum: ["scheduled", "ongoing", "ended"],
    default: "ongoing",
  },
});

const Meeting = mongoose.model("Meeting", meetingsSchema);

export default Meeting;
