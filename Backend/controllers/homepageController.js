const axios = require('axios');
require("dotenv").config();

// Replace 'your-github-username' with the actual username
const GITHUB_USERNAME = process.env.GITHUB_UNAME;

// Route to fetch repositories and render the homepage
async function getRepoList(req, res) {
  try {
    // Fetch repositories using GitHub API
    const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);
    const repositories = response.data;

    // Extract only the repository names
    const repoNames = repositories.map(repo => repo.name);

    // Render the EJS template and pass repository names and GitHub username
    res.render('home', { repoNames, GITHUB_USERNAME });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).send('An error occurred while fetching repositories.');
  }
}

module.exports = { getRepoList };
