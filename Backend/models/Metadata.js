const mongoose = require("mongoose");

const labMetadataSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    tags: { type: [String], default: [] },
    url: {
      type: String,
      required: true,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    totalVisits: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Reference to the User model
    }],
    visitedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Reference to the User model
    }],
  },
  { timestamps: true }
);

const labMetadataModel = mongoose.model("metadatas", labMetadataSchema);
module.exports = labMetadataModel;
