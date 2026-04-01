import mongoose from "mongoose";

const peerProfileSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    skills: [{ type: String, required: true }],
    bio: { type: String },
  },
  { timestamps: true }
);

peerProfileSchema.index({ skills: 1 });

export default mongoose.model("PeerProfile", peerProfileSchema);

