import mongoose from "mongoose";

const placementApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    registerNumber: { type: String, required: true },
    cgpa: { type: String, required: true },
    skills: { type: String },
    resumeImage: { type: String },
  },
  { timestamps: true }
);

const PlacementApplication = mongoose.model("PlacementApplication", placementApplicationSchema);

export default PlacementApplication;
