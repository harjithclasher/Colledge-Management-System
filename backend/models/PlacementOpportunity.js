import mongoose from "mongoose";

const placementOpportunitySchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    package: { type: String, default: "" },
    location: { type: String, default: "" },
    deadline: { type: String, default: "" },
    tag: { type: String, default: "New" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("PlacementOpportunity", placementOpportunitySchema);
