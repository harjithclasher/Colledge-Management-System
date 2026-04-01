import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    link: { type: String, default: "" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    audience: {
      type: String,
      enum: ["all", "students", "staff"],
      default: "all",
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
