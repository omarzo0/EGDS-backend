const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user_id: {
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
  submitted_at: {
    type: Date,
    default: Date.now,
  },
});

const FeedbackModel =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

module.exports = { FeedbackModel };
