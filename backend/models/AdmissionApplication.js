import mongoose from "mongoose";

const admissionApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    program: { type: String, required: true },
    score: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "Submitted",
        "Pending Review",
        "Documents Requested",
        "Documents Submitted",
        "Approved",
        "Rejected",
      ],
      default: "Submitted",
    },
    staffMessage: { type: String, default: "" },
    documentUrl: { type: String, default: "" },
    documentName: { type: String, default: "" },
    documentUploadedAt: { type: Date },
    scheduledVisitDate: { type: Date },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("AdmissionApplication", admissionApplicationSchema);
