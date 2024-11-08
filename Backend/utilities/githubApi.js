const fetch = require("node-fetch");

require("dotenv").config();
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Recursive function to fetch all files in a directory and its subdirectories
async function fetchAllFiles(repoName, dirPath = "") {
  const BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents`;
  const url = `${BASE_URL}/${dirPath}?ref=main`;
  let allFiles = [];

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching directory contents: ${response.statusText}`);
    }
    const files = await response.json();

    for (const file of files) {
      if (file.type === "file") {
        allFiles.push(file);
      } else if (file.type === "dir") {
        // Add a slight delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
        const subFiles = await fetchAllFiles(repoName, `${dirPath}/${file.name}`);
        allFiles = allFiles.concat(subFiles);
      }
    }
  } catch (error) {
    console.error(`Error in fetchAllFiles: ${error.message}`);
  }

  return allFiles;
}

// Fetch metadata for each repository, with pagination for up to 100 repos per page
async function fetchAllRepos() {
  const allRepos = [];
  let page = 1;
  let moreRepos = true;

  while (moreRepos) {
    const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching repositories: ${response.statusText}`);
      }

      const repos = await response.json();
      if (repos.length > 0) {
        allRepos.push(...repos);
        page += 1;
      } else {
        moreRepos = false;
      }
    } catch (error) {
      console.error(`Error in fetchAllRepos: ${error.message}`);
      moreRepos = false;
    }
  }

  return allRepos;
}

// Function to fetch the content of a specific file
async function fetchFileContent(repoName, filePath) {
  const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/main/${filePath}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error fetching file content");
    }
    const content = await response.text();
    return content;
  } catch (error) {
    console.error(`Error in fetchFileContent: ${error.message}`);
    return null;
  }
}

module.exports = { fetchAllFiles, fetchFileContent, fetchAllRepos };
