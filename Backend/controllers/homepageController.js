const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_UNAME;

const saveMetadata = (newMetadata) => {
  const metadataPath = path.join(__dirname, 'metadata.json');
  
  // Check if metadata.json exists
  let existingMetadata = [];

  if (fs.existsSync(metadataPath)) {
    // If it exists, read the current content of the file
    existingMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }

  // Check if the new metadata already exists based on the URL (or title)
  const isDuplicate = existingMetadata.some(
    (existing) => existing.url === newMetadata.url || existing.title === newMetadata.title
  );

  if (!isDuplicate) {
    // Append new metadata to the existing data if not a duplicate
    existingMetadata.push(newMetadata);

    // Save the updated metadata back to the file
    fs.writeFileSync(metadataPath, JSON.stringify(existingMetadata, null, 2));
  }
};



// Function to get the headers with the authentication token
const getAuthHeaders = () => ({
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
});

// Route to fetch repositories and send JSON response
async function getRepoList(req, res) {
  try {
    // Fetch repositories using GitHub API
    const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
      headers: getAuthHeaders(),
    });
    const repositories = response.data;

    // Extract only the repository names and metadata (title, description, URL)
    const repoData = repositories.map(repo => ({
      title: repo.name,
      url: repo.html_url,
      description: repo.description || 'No description available',
    }));

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
    // Create a new repository on GitHub
    const repoResponse = await axios.post(
      `https://api.github.com/user/repos`,
      {
        name: labName,
        private: false, // Set to 'true' if you want the repo to be private
      },
      {
        headers: getAuthHeaders(),
      }
    );

    // Upload the folder structure to GitHub repository
    const uploadFolder = async (folder, repoName, pathPrefix = '') => {
      for (let file of folder) {
        const filePath = path.join(__dirname, file.name);
        const content = fs.readFileSync(filePath, 'base64'); // Read the file content

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

    // Send success response with repository details
    res.json({ message: 'Repository created successfully', repoName: labName });
  } catch (error) {
    console.error('Error creating repository:', error);
    res.status(500).json({ message: 'An error occurred while creating the repository.', error: error.message });
  }
}

module.exports = { getRepoList, createLab ,saveMetadata};
