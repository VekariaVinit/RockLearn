const mongoose = require('mongoose');

const metadataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, default: 'No description available' },
  tags: { type: [String], default: [] },
});

// Check if the model exists before creating it
const Metadata = mongoose.models.Metadata || mongoose.model('Metadata', metadataSchema);

module.exports = Metadata;
