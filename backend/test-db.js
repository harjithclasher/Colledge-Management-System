
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync("test-output.txt", msg + "\n");
};

log("Checking MongoDB connection...");
log("URI: " + process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    log("SUCCESS: Connected to MongoDB");
    process.exit(0);
  })
  .catch((err) => {
    log("FAILURE: Could not connect to MongoDB");
    log(err.message);
    process.exit(1);
  });
