const fs = require('fs');
const path = require('path');

// Controller function to search labs
async function searchLabs(req, res) {
  try {
    const { q = '' } = req.query;

    // Ensure that the search query is provided
    if (!q) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    // Dynamically read metadata.json each time searchLabs is called
    const metadataPath = path.join(__dirname, 'metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    // Normalize the metadata to handle both direct objects and objects with numeric keys (e.g., "0", "1")
    let normalizedMetadata = [];

    metadata.forEach(item => {
      if (Array.isArray(item)) {
        // If the item is an array (like [ { ... }, { ... } ]), we flatten it
        normalizedMetadata = normalizedMetadata.concat(item);
      } else if (typeof item === 'object') {
        // If the item is an object with numeric keys (like "0": { ... })
        Object.keys(item).forEach(key => {
          normalizedMetadata.push(item[key]); // Push the object to the array
        });
      }
    });

    // Perform search across the normalized metadata
    const results = normalizedMetadata.filter(lab => {
      // Normalize the tags field (ensure it's an array)
      let normalizedTags = [];

      // If tags is a string (like "No tags available"), treat it as empty
      if (typeof lab.tags === 'string') {
        if (lab.tags.toLowerCase() === 'no tags available') {
          normalizedTags = []; // No tags, so set to empty array
        } else {
          normalizedTags = lab.tags.split(',').map(tag => tag.trim()); // If it's a string, split it into an array
        }
      } else if (Array.isArray(lab.tags)) {
        normalizedTags = lab.tags; // If it's already an array, just use it
      }

      // Check if title or any tag matches the search query (case-insensitive)
      const matchesTitle = lab.title && lab.title.toLowerCase().includes(q.toLowerCase());
      const matchesTags = normalizedTags.some(tag => tag.toLowerCase().includes(q.toLowerCase()));

      // Return true if any of the fields match (title or tags)
      return matchesTitle || matchesTags;
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
