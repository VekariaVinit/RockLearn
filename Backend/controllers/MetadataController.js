const fs = require('fs');
const path = require('path');

// Controller function to search labs
async function searchLabs(req, res) {
  try {
    const { q = '' } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    // Dynamically read metadata.json
    const metadataPath = path.join(__dirname, 'metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    const results = metadata.filter(lab => {
      const matchesTitle = lab.title && typeof lab.title === 'string' && lab.title.toLowerCase().includes(q.toLowerCase());
      const matchesTags = lab.tags && Array.isArray(lab.tags) && lab.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(q.toLowerCase()));

      return matchesTitle || matchesTags;
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching for labs:', error);
    res.status(500).json({ message: 'Error searching for labs', error: error.message });
  }
}

module.exports = {
  searchLabs,
};
