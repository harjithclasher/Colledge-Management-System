import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    message: { type: String, required: true },
    response: { type: String, default: "" },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
