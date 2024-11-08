const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_UNAME;

// Helper function to read existing metadata from metadata.json
const readMetadata = () => {
  const metadataPath = path.join(__dirname, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }
  return [];
};

// Modified saveMetadata function
const saveMetadata = (newMetadata) => {
  const metadataPath = path.join(__dirname, 'metadata.json');
  let existingMetadata = readMetadata();

  // Check if the metadata entry with the same title or URL exists
  let isUpdated = false;
  existingMetadata = existingMetadata.map((existing) => {
    if (existing.url === newMetadata.url || existing.title === newMetadata.title) {
      const hasChanges = Object.keys(newMetadata).some(
        key => existing[key] !== newMetadata[key]
      );

      if (hasChanges) {
        isUpdated = true;
        return { ...existing, ...newMetadata };
      }
      return existing;
    }
    return existing;
  });

  if (!isUpdated) {
    existingMetadata.push(newMetadata);
  }

  fs.writeFileSync(metadataPath, JSON.stringify(existingMetadata, null, 2));
};

// Function to get the headers with the authentication token
const getAuthHeaders = () => ({
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
});

// Route to fetch repositories and send JSON response
async function getRepoList(req, res) {
  try {
    const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
      headers: getAuthHeaders(),
    });
    const repositories = response.data;
    const metadata = readMetadata(); // Read metadata for tag lookup

    // Extract repository names, URLs, and descriptions, adding tags if available
    const repoData = repositories.map(repo => {
      // Find matching metadata by title
      const metadataEntry = metadata.find(m => m.title === repo.name);
      const tags = metadataEntry && metadataEntry.tags ? metadataEntry.tags : 'No tags available';

      return {
        title: repo.name,
        url: repo.html_url,
        description: repo.description || 'No description available',
        tags: tags,
      };
    });

    // Save metadata to a JSON file
    saveMetadata(repoData);

    // Send JSON response with repository names and metadata
    res.json({ repoNames: repositories.map(repo => repo.name), metadata: repoData });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ message: 'An error occurred while fetching repositories.', error: error.message });
  }
}

// Route to create a new repository and send JSON response
async function createLab(req, res) {
  const { labName } = req.body;
  const folderPath = req.files.folder;

  try {
    const repoResponse = await axios.post(
      `https://api.github.com/user/repos`,
      {
        name: labName,
        private: false,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    const uploadFolder = async (folder, repoName, pathPrefix = '') => {
      for (let file of folder) {
        const filePath = path.join(__dirname, file.name);
        const content = fs.readFileSync(filePath, 'base64');

        await axios.put(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${pathPrefix}${file.name}`,
          {
            message: `add ${file.name}`,
            content: content,
          },
          {
            headers: getAuthHeaders(),
          }
        );
      }
    };

    await uploadFolder(folderPath, labName);

    res.json({ message: 'Repository created successfully', repoName: labName });
  } catch (error) {
    console.error('Error creating repository:', error);
    res.status(500).json({ message: 'An error occurred while creating the repository.', error: error.message });
  }
}

module.exports = { getRepoList, createLab, saveMetadata };
