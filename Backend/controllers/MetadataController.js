// controllers/metadataController.js

const metadata = require('./metadata.json'); // Assuming metadata is in a JSON file

// Controller function to search labs
async function searchLabs(req, res) {
  try {
    const { q } = req.query; // Capture the search query
    if (!q) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    // Filter metadata to match query (case insensitive)
    const results = metadata.filter(lab =>
      lab.title.toLowerCase().includes(q.toLowerCase())
    );

    // Send the filtered results back to the client
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching for labs:', error);
    res.status(500).json({ message: 'Error searching for labs', error: error.message });
  }
}

module.exports = {
  searchLabs,
  // other controller functions (if any)
};
