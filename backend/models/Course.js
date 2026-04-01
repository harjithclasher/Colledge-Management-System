import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: {
      type: String,
      enum: [
        "Computer Science",
        "Electronics",
        "Mechanical",
        "Civil",
        "Business",
        "Mathematics",
        "Physics",
        "Chemistry",
      ],
      required: true,
    },
    faculty: { type: String },
    credits: { type: Number },
    description: { type: String },
    semester: { type: String },
    imageUrl: { type: String },
    syllabusText: { type: String, default: "" },
    syllabusUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);

