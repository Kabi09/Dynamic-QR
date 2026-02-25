const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    size: {
      type: Number,
      default: 300,
      min: 100,
      max: 1000,
    },
    targetUrl: {
      type: String,
      required: [true, "Target URL is required"],
      trim: true,
    },
    shortId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QrCode", qrCodeSchema);
