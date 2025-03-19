const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    Citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
    feedback_text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: ["New", "Reviewed"],
      default: "New",
    },
  },
  { timestamps: true }
);

const FeedbackModel =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

module.exports = { FeedbackModel };
