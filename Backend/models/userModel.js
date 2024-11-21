const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match:
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    activated: {
      type: Boolean,
      default: false,
      required: true,
    },
    likedLabs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'metadatas',  // Reference to the Lab model
    }],
    visitedLabs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'metadatas',  // Reference to the Lab model
    }],
  },
  { timestamps: true }
);

const userModel = mongoose.model("userModel", userSchema);
module.exports = userModel;
