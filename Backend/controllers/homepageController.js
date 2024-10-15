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

    // Render the EJS template and pass repositories data
    res.render('home', { repositories, GITHUB_USERNAME });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).send('An error occurred while fetching repositories.');
  }
};


module.exports = { getRepoList };
