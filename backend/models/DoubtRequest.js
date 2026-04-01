import mongoose from "mongoose";

const doubtRequestSchema = new mongoose.Schema(
  {
    fromName: { type: String, required: true },
    fromEmail: { type: String, required: true },
    toEmail: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    skill: { type: String },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    response: { type: String, default: "" },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("DoubtRequest", doubtRequestSchema);

