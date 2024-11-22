const Metadata = require('../models/Metadata'); // Adjust the path to your Metadata model

// Controller function to search labs
async function searchLabs(req, res) {
  try {
    const { q = '' } = req.query;

    // Ensure that the search query is provided
    if (!q) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    // Define a case-insensitive regex pattern for the search query
    const searchRegex = new RegExp(q, 'i');

    // Query MongoDB for labs where the title or tags match the search query
    const results = await Metadata.find({
      $or: [
        { title: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } }
      ]
    });

    // Send results back to client
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching for labs:', error);
    res.status(500).json({ message: 'Error searching for labs', error: error.message });
  }
}

module.exports = {
  searchLabs,
};
